import { MultichainLibrary, xDAI } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction } from 'react'

interface Options {
    library: MultichainLibrary
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createSushiStep(options: Options) {
    return {
        name: 'sushi',
        action: async (context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            const bzzBefore = await options.library.getGnosisBzzBalance(options.targetAddress)
            context.set('daiBefore', daiBefore)
            context.set('bzzBefore', bzzBefore)
            const plannedDai = xDAI.fromFloat(options.bzzUsdValue)
            const amount =
                daiBefore.subtract(options.library.constants.daiDustAmount).compare(plannedDai) === -1
                    ? daiBefore.subtract(options.library.constants.daiDustAmount)
                    : plannedDai
            const tx = await options.library.swapOnGnosisAuto({
                amount: amount.toString(),
                originPrivateKey: options.temporaryPrivateKey,
                to: options.targetAddress
            })
            options.setMetadata(previous => ({ ...previous, sushi: `https://gnosisscan.io/tx/${tx}` }))
        }
    }
}
