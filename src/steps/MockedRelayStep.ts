import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, System } from 'cafe-utility'
import { WalletClient } from 'viem'
import { SendTransactionSignature } from '../Flow'

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

export function createMockedRelayStep(_options: Options) {
    return {
        name: 'relay',
        action: async (_context: Map<string, unknown>) => {
            await System.sleepMillis(500)
        }
    }
}
