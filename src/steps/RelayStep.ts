import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber } from 'cafe-utility'
import { WalletClient } from 'viem'

interface Options {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    temporaryAddress: `0x${string}`
    sourceTokenAmount: FixedPointNumber
    sendTransactionAsync: (tx: { to: `0x${string}`; value: bigint }) => Promise<`0x${string}`>
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
}

export function createRelayStep(options: Options) {
    return {
        name: 'relay',
        action: async (context: Map<string, unknown>) => {
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
    }
}
