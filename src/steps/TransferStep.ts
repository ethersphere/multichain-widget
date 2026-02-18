import { MultichainLibrary } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction } from 'react'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createTransferStep(options: Options) {
    return {
        name: 'transfer',
        precondition: async () => {
            const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            const amountToTransfer = dai.subtract(options.library.constants.daiDustAmount)
            return amountToTransfer.value > options.library.constants.daiDustAmount.value
        },
        action: async (context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            const tx = await options.library.transferGnosisNative({
                originPrivateKey: options.temporaryPrivateKey,
                to: options.targetAddress,
                amount: daiBefore.subtract(options.library.constants.daiDustAmount).toString()
            })
            options.setMetadata(previous => ({ ...previous, transfer: `https://gnosisscan.io/tx/${tx}` }))
        }
    }
}
