import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, Solver } from 'cafe-utility'
import { WalletClient } from 'viem'

interface FlowOptions {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    sourceTokenAmount: FixedPointNumber
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    sendTransactionAsync: (tx: { to: `0x${string}`; value: bigint }) => Promise<`0x${string}`>
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
}

export function createFlow(options: FlowOptions) {
    const solver = new Solver()

    solver.addStep({
        name: 'relay',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            if (
                options.sourceToken === options.library.constants.nullAddress &&
                options.sourceChain === options.library.constants.gnosisChainId
            ) {
                await options.sendTransactionAsync({
                    to: options.temporaryAddress,
                    value: options.sourceTokenAmount.value
                })
            } else {
                await options.relayClient.actions.execute({
                    quote: options.relayQuote,
                    wallet: options.walletClient,
                    onProgress: console.log
                })
            }
        }
    })

    solver.addStep({
        name: 'relay-sync',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = context.get('daiBefore') as FixedPointNumber
            await options.library.waitForGnosisNativeBalanceToIncrease(options.temporaryAddress, daiBefore.value)
        }
    })

    solver.addStep({
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
    })

    solver.addStep({
        name: 'sushi-sync',
        precondition: async () => true,
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = context.get('daiBefore') as FixedPointNumber
            const bzzBefore = context.get('bzzBefore') as FixedPointNumber
            await options.library.waitForGnosisBzzBalanceToIncrease(options.targetAddress, bzzBefore.value)
            await options.library.waitForGnosisNativeBalanceToDecrease(options.temporaryAddress, daiBefore.value)
        }
    })

    solver.addStep({
        name: 'transfer',
        precondition: async () => {
            const dai = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            const amountToTransfer = dai.subtract(options.library.constants.daiDustAmount)
            return amountToTransfer.value > options.library.constants.daiDustAmount.value
        },
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = await options.library.getGnosisNativeBalance(options.temporaryAddress)
            context.set('daiBefore', daiBefore)
            await options.library.transferGnosisNative({
                originPrivateKey: options.temporaryPrivateKey,
                to: options.targetAddress,
                amount: daiBefore.subtract(options.library.constants.daiDustAmount).toString()
            })
        }
    })

    solver.addStep({
        name: 'transfer-sync',
        precondition: async () => true,
        transientSkipStepName: 'transfer',
        action: async (_stepName: string, context: Map<string, unknown>) => {
            const daiBefore = context.get('daiBefore') as FixedPointNumber
            await options.library.waitForGnosisNativeBalanceToDecrease(options.temporaryAddress, daiBefore.value)
        }
    })

    return solver
}
