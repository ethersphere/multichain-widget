import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
}

export function createMockedRelaySyncStep(_options: Options) {
    return {
        name: 'relay-sync',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
        }
    }
}
