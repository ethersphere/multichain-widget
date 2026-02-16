import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
}

export function createMockedApproveBzzStep(_options: Options) {
    return {
        name: 'approve-bzz',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
        }
    }
}
