import { System } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'

interface Options {
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
        }
    }
}
