import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createRelaySyncStep(options: Options) {
    return {
        name: 'relay-sync',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = context.get('daiBefore') as FixedPointNumber
            await options.library.waitForGnosisNativeBalanceToIncrease(options.temporaryAddress, daiBefore.value)
        }
    }
}
