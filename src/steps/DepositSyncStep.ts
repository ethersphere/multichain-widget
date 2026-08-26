import { MultichainLibrary, xDAI } from '@upcoming/multichain-library'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createDepositSyncStep(options: Options) {
    return {
        name: 'deposit-sync',
        transientSkipStepName: 'deposit',
        action: async (context: Map<string, unknown>) => {
            const daiBefore = xDAI.cast(context.get('daiBefore'))
            await options.library.waitForGnosisNativeBalanceToIncrease(options.temporaryAddress, daiBefore.value)
            postPaymentEvent({
                phase: 'delivered',
                chainId: options.library.constants.gnosisChainId,
                temporaryAddress: options.temporaryAddress
            })
        }
    }
}
