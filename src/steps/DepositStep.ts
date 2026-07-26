import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { SendTransactionSignature } from '../Flow'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    sourceTokenAmount: FixedPointNumber
    totalDaiValue: FixedPointNumber
    sendTransactionAsync: SendTransactionSignature
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createDepositStep(options: Options) {
    return {
        name: 'deposit',
        precondition: async () => {
            const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            return dai.value < options.totalDaiValue.value
        },
        action: async (context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            const tx = await options.sendTransactionAsync({
                to: options.temporaryAddress,
                value: options.sourceTokenAmount.value
            })
            options.setMetadata(previous => ({ ...previous, deposit: `https://gnosisscan.io/tx/${tx}` }))
        }
    }
}