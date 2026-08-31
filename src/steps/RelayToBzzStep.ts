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

function readExpectedBzzAmount(relayQuote: Execute): bigint | null {
    // `minimumAmount` is the floor Relay guarantees to deliver, so a wallet funded by an
    // earlier run of this very quote is guaranteed to hold at least that much.
    const currencyOut = relayQuote.details?.currencyOut
    const amount = currencyOut?.minimumAmount || currencyOut?.amount
    try {
        return amount ? BigInt(amount) : null
    } catch {
        return null
    }
}

export function createRelayToBzzStep(options: Options) {
    return {
        name: 'relay',
        precondition: async () => {
            // Only the `batch` route lands on the temporary wallet, and only there can the
            // step be skipped: in `funding` mode the destination is the user's own wallet,
            // which may hold xBZZ for reasons that have nothing to do with this payment.
            if (!options.routesThroughTemporaryWallet) {
                return true
            }
            const expectedBzz = readExpectedBzzAmount(options.relayQuote)
            if (expectedBzz === null) {
                return true
            }
            const bzz = await options.library.getGnosisBzzBalance(options.temporaryAddress)
            const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            // The gas top-up has to be there as well, otherwise the steps that spend it
            // would keep failing with no way left to pay for the gas.
            const funded = bzz.value >= expectedBzz && dai.compare(options.library.constants.daiDustAmount) === 1
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
            const bzzBefore = await options.library.getGnosisBzzBalance(options.targetAddress)
            context.set('bzzBefore', bzzBefore)
            if (options.routesThroughTemporaryWallet) {
                // The gas top-up lands on the same recipient, and the steps after the sync
                // one spend it, so the sync step has to be able to wait for it too.
                const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
                context.set('topupDaiBefore', daiBefore)
            }

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
