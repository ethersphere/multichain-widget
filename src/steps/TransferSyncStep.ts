import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createTransferSyncStep(options: Options) {
    return {
        name: 'transfer-sync',
        transientSkipStepName: 'transfer',
        action: async (context: Map<string, unknown>) => {
            const daiBefore = FixedPointNumber.cast(context.get('daiBefore'))
            await options.library.waitForGnosisNativeBalanceToDecrease(options.temporaryAddress, daiBefore.value)
        }
    }
}
