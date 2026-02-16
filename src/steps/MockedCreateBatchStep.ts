import { MultichainLibrary } from '@upcoming/multichain-library'
import { Strings, System } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    batchAmount: string | bigint
    batchDepth: number
}

export function createMockedCreateBatchStep(options: Options) {
    return {
        name: 'create-batch',
        action: async (context: Map<string, unknown>) => {
            await System.sleepMillis(500)
            const batchId = `0x${Strings.randomHex(64)}`
            const message = {
                event: 'batch',
                batchId,
                depth: options.batchDepth,
                amount: options.batchAmount.toString(),
                blockNumber: '0x2aa1944'
            }
            console.log('Postage batch created', message)
            postMessage(message, '*')
            context.set('batchId', batchId)
        }
    }
}
