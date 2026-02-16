import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
}

export function createMockedSushiStep(_options: Options) {
    return {
        name: 'sushi',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
        }
    }
}
