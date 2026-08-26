import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { SendTransactionSignature } from '../Flow'
import { postPaymentEvent } from '../PaymentEvent'

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
            const funded = dai.value >= options.totalDaiValue.value
            if (funded) {
                // Implicit resume: no payment is made, but the funds are already on the
                // temporary wallet and the Gnosis-side steps are about to spend them, so
                // the host must treat this run as paid.
                postPaymentEvent({
                    phase: 'delivered',
                    chainId: options.library.constants.gnosisChainId,
                    temporaryAddress: options.temporaryAddress,
                    resumed: true
                })
            }
            return !funded
        },
        action: async (context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            const tx = await options.sendTransactionAsync({
                to: options.temporaryAddress,
                value: options.sourceTokenAmount.value
            })
            options.setMetadata(previous => ({ ...previous, deposit: `https://gnosisscan.io/tx/${tx}` }))
            postPaymentEvent({
                phase: 'sent',
                chainId: options.library.constants.gnosisChainId,
                temporaryAddress: options.temporaryAddress,
                txHash: tx
            })
        }
    }
}
