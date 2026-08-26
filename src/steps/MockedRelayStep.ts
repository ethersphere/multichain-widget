import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, System } from 'cafe-utility'
import { WalletClient } from 'viem'
import { SendTransactionSignature } from '../Flow'
import { postPaymentEvent } from '../PaymentEvent'

interface Options {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    temporaryAddress: `0x${string}`
    sourceTokenAmount: FixedPointNumber
    sendTransactionAsync: SendTransactionSignature
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
}

export function createMockedRelayStep(options: Options) {
    return {
        name: 'relay',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
            postPaymentEvent({
                phase: 'sent',
                chainId: options.sourceChain,
                temporaryAddress: options.temporaryAddress,
                txHash: `0x${'0'.repeat(64)}`
            })
        }
    }
}
