import { Execute, ProgressData, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { selectExplorerForChainId } from '../Utility'

interface Options {
    library: MultichainLibrary
    targetAddress: `0x${string}`
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
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
            if(!topUp) {
                throw new Error('Relay quote does not include a gas topup amount')
            }

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
                        }
                    }
                }
            })
        }
    }
}