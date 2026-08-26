import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createMockedDepositSyncStep(options: Options) {
    return {
        name: 'deposit-sync',
        action: async () => {
            await System.sleepMillis(1000)
            postPaymentEvent({
                phase: 'delivered',
                chainId: options.library.constants.gnosisChainId,
                temporaryAddress: options.temporaryAddress
            })
        }
    }
}
