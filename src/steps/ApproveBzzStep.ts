import { MultichainLibrary, xBZZ } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction } from 'react'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createApproveBzzStep(options: Options) {
    return {
        name: 'approve-bzz',
        action: async (context: Map<string, unknown>) => {
            const nonce = await options.library.getGnosisTransactionCount(options.temporaryAddress)
            context.set('nonce', nonce)
            const tx = await options.library.approveGnosisBzz({
                amount: xBZZ.fromDecimalString('1000').toString(),
                spender: options.library.constants.postageStampGnosisAddress,
                originPrivateKey: options.temporaryPrivateKey,
                nonce
            })
            options.setMetadata(previous => ({ ...previous, approve: `https://gnosisscan.io/tx/${tx}` }))
        }
    }
}
