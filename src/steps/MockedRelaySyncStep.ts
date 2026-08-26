import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createMockedRelaySyncStep(options: Options) {
    return {
        name: 'relay-sync',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
            postPaymentEvent({
                phase: 'delivered',
                chainId: options.library.constants.gnosisChainId,
                temporaryAddress: options.temporaryAddress
            })
        }
    }
}
