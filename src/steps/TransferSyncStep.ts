import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createTransferSyncStep(options: Options) {
    return {
        name: 'transfer-sync',
        precondition: async () => true,
        transientSkipStepName: 'transfer',
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = context.get('daiBefore') as FixedPointNumber
            await options.library.waitForGnosisNativeBalanceToDecrease(options.temporaryAddress, daiBefore.value)
        }
    }
}
