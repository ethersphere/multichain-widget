import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, Solver } from 'cafe-utility'
import { WalletClient } from 'viem'
import { createRelayStep } from './steps/RelayStep'
import { createRelaySyncStep } from './steps/RelaySyncStep'
import { createSushiStep } from './steps/SushiStep'
import { createSushiSyncStep } from './steps/SushiSyncStep'
import { createTransferStep } from './steps/TransferStep'
import { createTransferSyncStep } from './steps/TransferSyncStep'

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

    solver.addStep(createRelayStep(options))
    solver.addStep(createRelaySyncStep(options))
    solver.addStep(createSushiStep(options))
    solver.addStep(createSushiSyncStep(options))
    solver.addStep(createTransferStep(options))
    solver.addStep(createTransferSyncStep(options))

    return solver
}
