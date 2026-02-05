import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    targetAddress: `0x${string}`
}

export function createSushiSyncStep(options: Options) {
    return {
        name: 'sushi-sync',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = FixedPointNumber.cast(context.get('daiBefore'))
            const bzzBefore = FixedPointNumber.cast(context.get('bzzBefore'))
            await options.library.waitForGnosisBzzBalanceToIncrease(options.targetAddress, bzzBefore.value)
            await options.library.waitForGnosisNativeBalanceToDecrease(options.temporaryAddress, daiBefore.value)
        }
    }
}
