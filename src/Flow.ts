import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, Solver } from 'cafe-utility'
import { WalletClient } from 'viem'
import { createApproveBzzStep } from './steps/ApproveBzzStep'
import { createCreateBatchStep } from './steps/CreateBatchStep'
import { createMockedApproveBzzStep } from './steps/MockedApproveBzzStep'
import { createMockedCreateBatchStep } from './steps/MockedCreateBatchStep'
import { createMockedRelayStep } from './steps/MockedRelayStep'
import { createMockedRelaySyncStep } from './steps/MockedRelaySyncStep'
import { createMockedSushiStep } from './steps/MockedSushiStep'
import { createMockedSushiSyncStep } from './steps/MockedSushiSyncStep'
import { createMockedTransferStep } from './steps/MockedTransferStep'
import { createMockedTransferSyncStep } from './steps/MockedTransferSyncStep'
import { createRelayStep } from './steps/RelayStep'
import { createRelaySyncStep } from './steps/RelaySyncStep'
import { createSushiStep } from './steps/SushiStep'
import { createSushiSyncStep } from './steps/SushiSyncStep'
import { createTransferStep } from './steps/TransferStep'
import { createTransferSyncStep } from './steps/TransferSyncStep'

export type SendTransactionSignature = (tx: { to: `0x${string}`; value: bigint }) => Promise<`0x${string}`>

interface FundingFlowOptions {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    sourceTokenAmount: FixedPointNumber
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    sendTransactionAsync: SendTransactionSignature
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
    mocked: boolean
}

export function createFundingFlow(options: FundingFlowOptions) {
    const solver = new Solver()

    if (options.mocked) {
        solver.addStep(createMockedRelayStep(options))
        solver.addStep(createMockedRelaySyncStep(options))
        solver.addStep(createMockedSushiStep(options))
        solver.addStep(createMockedSushiSyncStep(options))
        solver.addStep(createMockedTransferStep(options))
        solver.addStep(createMockedTransferSyncStep(options))
    } else {
        solver.addStep(createRelayStep(options))
        solver.addStep(createRelaySyncStep(options))
        solver.addStep(createSushiStep(options))
        solver.addStep(createSushiSyncStep(options))
        solver.addStep(createTransferStep(options))
        solver.addStep(createTransferSyncStep(options))
    }

    return solver
}

interface CreateBatchFlowOptions {
    library: MultichainLibrary
    sourceChain: number
    sourceToken: string
    sourceTokenAmount: FixedPointNumber
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    sendTransactionAsync: SendTransactionSignature
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
    batchAmount: string | bigint
    batchDepth: number
    mocked: boolean
}

export function createCreateBatchFlow(options: CreateBatchFlowOptions) {
    const solver = new Solver()

    if (options.mocked) {
        solver.addStep(createMockedRelayStep(options))
        solver.addStep(createMockedRelaySyncStep(options))
        solver.addStep(createMockedSushiStep({ ...options, targetAddress: options.temporaryAddress }))
        solver.addStep(createMockedSushiSyncStep({ ...options, targetAddress: options.temporaryAddress }))
        solver.addStep(createMockedApproveBzzStep(options))
        solver.addStep(createMockedCreateBatchStep(options))
        solver.addStep(createMockedTransferStep(options))
        solver.addStep(createMockedTransferSyncStep(options))
    } else {
        solver.addStep(createRelayStep(options))
        solver.addStep(createRelaySyncStep(options))
        solver.addStep(createSushiStep({ ...options, targetAddress: options.temporaryAddress }))
        solver.addStep(createSushiSyncStep({ ...options, targetAddress: options.temporaryAddress }))
        solver.addStep(createApproveBzzStep(options))
        solver.addStep(createCreateBatchStep(options))
        solver.addStep(createTransferStep(options))
        solver.addStep(createTransferSyncStep(options))
    }

    return solver
}
