import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createRelaySyncStep(options: Options) {
    return {
        name: 'relay-sync',
        action: async (context: Map<string, unknown>) => {
            const daiBefore = FixedPointNumber.cast(context.get('daiBefore'))
            await options.library.waitForGnosisNativeBalanceToIncrease(options.temporaryAddress, daiBefore.value)
        }
    }
}
