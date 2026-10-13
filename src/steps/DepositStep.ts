import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { SendTransactionSignature, SwitchChainSignature } from '../Flow'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    sourceAddress: `0x${string}`
    sourceTokenAmount: FixedPointNumber
    totalDaiValue: FixedPointNumber
    sendTransactionAsync: SendTransactionSignature
    switchChainAsync: SwitchChainSignature
    walletClient: WalletClient
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
            // The network may have been changed in the wallet after Gnosis was selected as the
            // source chain, so it is switched back right before sending. Only when needed, as some
            // connectors (e.g. Safe) cannot switch at all and would fail even when already on Gnosis.
            if ((await options.walletClient.getChainId()) !== options.library.constants.gnosisChainId) {
                await options.switchChainAsync({ chainId: options.library.constants.gnosisChainId })
            }
            const tx = await options.sendTransactionAsync({
                to: options.temporaryAddress,
                value: options.sourceTokenAmount.value,
                // Fails instead of sending on another network if it was changed again in the meantime.
                chainId: options.library.constants.gnosisChainId,
                // Without it the wallet sends from whichever account is active at this point, which
                // may have been switched in the wallet after the Fund button was clicked.
                account: options.sourceAddress
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
