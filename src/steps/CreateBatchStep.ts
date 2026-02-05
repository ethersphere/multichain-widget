import { MultichainLibrary } from '@upcoming/multichain-library'
import { Strings, Types } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    batchAmount: string | bigint
    batchDepth: number
}

export function createCreateBatchStep(options: Options) {
    return {
        name: 'create-batch',
        action: async (context: Map<string, unknown>) => {
            const nonce = Types.asNumber(context.get('nonce'))
            const batchId = await options.library.createBatchGnosis({
                amount: options.batchAmount,
                depth: options.batchDepth,
                originPrivateKey: options.temporaryPrivateKey,
                immutable: false,
                batchNonce: `0x${Strings.randomHex(64)}` as `0x${string}`,
                bucketDepth: 16,
                owner: Types.asHexString(options.targetAddress),
                nonce: nonce + 1
            })
            context.set('batchId', batchId)
        }
    }
}
