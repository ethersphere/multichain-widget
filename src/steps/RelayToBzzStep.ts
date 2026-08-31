import { Execute, ProgressData, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { postPaymentEvent } from '../PaymentEvent'
import { selectExplorerForChainId } from '../Utility'

interface Options {
    library: MultichainLibrary
    targetAddress: `0x${string}`
    temporaryAddress: `0x${string}`
    relayQuote: Execute
    relayClient: RelayClient
    walletClient: WalletClient
    // Set when `targetAddress` is the temporary wallet, which is the case in `batch`
    // mode: the temporary wallet is the one that approves the xBZZ spending and pays
    // for the batch. In `funding` mode Relay delivers straight to the destination, so
    // there is no temporary wallet in the route.
    routesThroughTemporaryWallet?: boolean
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createRelayToBzzStep(options: Options) {
    return {
        name: 'relay',
        action: async (context: Map<string, unknown>) => {
            const bzzBefore = await options.library.getGnosisBzzBalance(options.targetAddress)
            context.set('bzzBefore', bzzBefore)

            // Sometimes there is a time delay with the fetched quote and config quote on Relay, if it's not the same,
            // we need to throw error, otherwise gas pop-up will not happen and have to wait for a new quote to be fetched

            const topUp = (options.relayQuote as any)?.details?.currencyGasTopup
            if (!topUp) {
                throw new Error('Relay quote does not include a gas topup amount')
            }

            let paymentSent = false
            await options.relayClient.actions.execute({
                quote: options.relayQuote,
                wallet: options.walletClient,
                onProgress: (data: ProgressData) => {
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
                                    txHash: txHash.txHash,
                                    temporaryAddress: options.routesThroughTemporaryWallet
                                        ? options.temporaryAddress
                                        : undefined
                                })
                            }
                        }
                    }
                }
            })
        }
    }
}
