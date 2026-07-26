import { MultichainLibrary, xBZZ } from '@upcoming/multichain-library'

interface Options {
    library: MultichainLibrary
    targetAddress: `0x${string}`
}

export function createRelayBzzSyncStep(options: Options) {
    return {
        name: 'relay-sync',
        action: async (context: Map<string, unknown>) => {
            const bzzBefore = xBZZ.cast(context.get('bzzBefore'))
            await options.library.waitForGnosisBzzBalanceToIncrease(options.targetAddress, bzzBefore.value)
        }
    }
}