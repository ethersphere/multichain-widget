import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
}

export function createApproveBzzStep(options: Options) {
    return {
        name: 'approve-bzz',
        action: async (context: Map<string, unknown>) => {
            const nonce = await options.library.getGnosisTransactionCount(options.temporaryAddress)
            context.set('nonce', nonce)
            await options.library.approveGnosisBzz({
                amount: FixedPointNumber.fromDecimalString('1000', 16).toString(),
                spender: options.library.constants.postageStampGnosisAddress,
                originPrivateKey: options.temporaryPrivateKey,
                nonce
            })
        }
    }
}
