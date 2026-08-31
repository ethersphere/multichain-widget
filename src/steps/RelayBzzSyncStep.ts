import { MultichainLibrary, xBZZ, xDAI } from '@upcoming/multichain-library'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    targetAddress: `0x${string}`
    temporaryAddress: `0x${string}`
    // See `createRelayToBzzStep`: only the `batch` mode route lands on the temporary
    // wallet, and only that route has further steps to report a delivery for.
    routesThroughTemporaryWallet?: boolean
}

export function createRelayBzzSyncStep(options: Options) {
    return {
        name: 'relay-sync',
        transientSkipStepName: 'relay',
        action: async (context: Map<string, unknown>) => {
            const bzzBefore = xBZZ.cast(context.get('bzzBefore'))
            await options.library.waitForGnosisBzzBalanceToIncrease(options.targetAddress, bzzBefore.value)
            if (options.routesThroughTemporaryWallet) {
                // The xBZZ and the gas top-up can arrive in separate transactions, and the
                // steps after this one pay for their gas out of the top-up, so wait until
                // the temporary wallet can actually cover a transaction.
                const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
                if (dai.compare(options.library.constants.daiDustAmount) !== 1) {
                    const daiBefore = xDAI.cast(context.get('topupDaiBefore'))
                    await options.library.waitForGnosisNativeBalanceToIncrease(
                        options.temporaryAddress,
                        daiBefore.value
                    )
                }
                postPaymentEvent({
                    phase: 'delivered',
                    chainId: options.library.constants.gnosisChainId,
                    temporaryAddress: options.temporaryAddress
                })
            }
        }
    }
}
