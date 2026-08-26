import { Execute, ProgressData, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { SendTransactionSignature } from '../Flow'
import { postPaymentEvent } from '../PaymentEvent'
import { selectExplorerForChainId } from '../Utility'

interface Options {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    temporaryAddress: `0x${string}`
    sourceTokenAmount: FixedPointNumber
    sendTransactionAsync: SendTransactionSignature
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
    totalDaiValue: FixedPointNumber
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createRelayStep(options: Options) {
    return {
        name: 'relay',
        precondition: async () => {
            const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            const funded = dai.value >= options.totalDaiValue.value
            if (funded) {
                // Implicit resume: no payment is made, but the funds are already on the
                // temporary wallet and the Gnosis-side steps are about to spend them, so
                // the host must treat this run as paid.
                postPaymentEvent({
                    phase: 'delivered',
                    chainId: options.library.constants.gnosisChainId,
                    temporaryAddress: options.temporaryAddress,
                    resumed: true
                })
            }
            return !funded
        },
        action: async (context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            if (
                options.sourceToken === options.library.constants.nullAddress &&
                options.sourceChain === options.library.constants.gnosisChainId
            ) {
                const tx = await options.sendTransactionAsync({
                    to: options.temporaryAddress,
                    value: options.sourceTokenAmount.value
                })
                options.setMetadata(previous => ({ ...previous, relay: `https://gnosisscan.io/tx/${tx}` }))
                postPaymentEvent({
                    phase: 'sent',
                    chainId: options.sourceChain,
                    temporaryAddress: options.temporaryAddress,
                    txHash: tx
                })
            } else {
                let paymentSent = false
                await options.relayClient.actions.execute({
                    quote: options.relayQuote,
                    wallet: options.walletClient,
                    onProgress: (data: ProgressData) => {
                        console.log('Relay progress data', data)
                        if (data.txHashes) {
                            const txHash = data.txHashes.find(x => x.txHash.length >= 64)
                            if (txHash) {
                                options.setMetadata(previous => ({
                                    ...previous,
                                    relay: `${selectExplorerForChainId(txHash.chainId)}/tx/${txHash.txHash}`
                                }))
                                if (!paymentSent) {
                                    paymentSent = true
                                    postPaymentEvent({
                                        phase: 'sent',
                                        chainId: txHash.chainId,
                                        temporaryAddress: options.temporaryAddress,
                                        txHash: txHash.txHash
                                    })
                                }
                            }
                        }
                    }
                })
            }
        }
    }
}
