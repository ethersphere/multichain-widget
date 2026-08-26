import { MultichainLibrary } from '@upcoming/multichain-library'
import { System } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    temporaryAddress: `0x${string}`
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createMockedDepositStep(options: Options) {
    return {
        name: 'deposit',
        action: async () => {
            await System.sleepMillis(1000)
            options.setMetadata(previous => ({
                ...previous,
                deposit: 'https://gnosisscan.io/tx/0x0000000000000000000000000000000000000000000000000000000000000000'
            }))
            postPaymentEvent({
                phase: 'sent',
                chainId: options.library.constants.gnosisChainId,
                temporaryAddress: options.temporaryAddress,
                txHash: `0x${'0'.repeat(64)}`
            })
        }
    }
}
