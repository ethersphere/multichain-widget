import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createMockedTransferSyncStep(_options: Options) {
    return {
        name: 'transfer-sync',
        transientSkipStepName: 'transfer',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
        }
    }
}
