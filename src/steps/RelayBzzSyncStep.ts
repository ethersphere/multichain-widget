import { MultichainLibrary, xBZZ } from '@upcoming/multichain-library'
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
        action: async (context: Map<string, unknown>) => {
            const bzzBefore = xBZZ.cast(context.get('bzzBefore'))
            await options.library.waitForGnosisBzzBalanceToIncrease(options.targetAddress, bzzBefore.value)
            if (options.routesThroughTemporaryWallet) {
                postPaymentEvent({
                    phase: 'delivered',
                    chainId: options.library.constants.gnosisChainId,
                    temporaryAddress: options.temporaryAddress
                })
            }
        }
    }
}
