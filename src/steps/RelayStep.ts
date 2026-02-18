import { Execute, ProgressData, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { SendTransactionSignature } from '../Flow'
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
            return dai.value < options.totalDaiValue.value
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
            } else {
                await options.relayClient.actions.execute({
                    quote: options.relayQuote,
                    wallet: options.walletClient,
                    onProgress: (data: ProgressData) => {
                        console.log('Relay progress data', data)
                        const txHashes = data.txHashes
                        if (txHashes && txHashes[0]) {
                            options.setMetadata(previous => ({
                                ...previous,
                                relay: `${selectExplorerForChainId(txHashes[0].chainId)}/tx/${txHashes[0].txHash}`
                            }))
                        }
                    }
                })
            }
        }
    }
}
