import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'

interface Options {
    library: MultichainLibrary
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
}

export function createSushiStep(options: Options) {
    return {
        name: 'sushi',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            const bzzBefore = await options.library.getGnosisBzzBalance(options.targetAddress)
            context.set('daiBefore', daiBefore)
            context.set('bzzBefore', bzzBefore)
            const amount = FixedPointNumber.fromDecimalString(options.bzzUsdValue.toString(), 18)
            await options.library.swapOnGnosisAuto({
                amount: amount.toString(),
                originPrivateKey: options.temporaryPrivateKey,
                to: options.targetAddress
            })
        }
    }
}
