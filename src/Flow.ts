import { Execute, RelayClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { FixedPointNumber, Solver } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { WalletClient } from 'viem'
import { createApproveBzzStep } from './steps/ApproveBzzStep'
import { createCreateBatchStep } from './steps/CreateBatchStep'
import { createDepositStep } from './steps/DepositStep'
import { createDepositSyncStep } from './steps/DepositSyncStep'
import { createMockedApproveBzzStep } from './steps/MockedApproveBzzStep'
import { createMockedCreateBatchStep } from './steps/MockedCreateBatchStep'
import { createMockedDepositStep } from './steps/MockedDepositStep'
import { createMockedDepositSyncStep } from './steps/MockedDepositSyncStep'
import { createMockedRelayStep } from './steps/MockedRelayStep'
import { createMockedRelaySyncStep } from './steps/MockedRelaySyncStep'
import { createMockedSushiStep } from './steps/MockedSushiStep'
import { createMockedSushiSyncStep } from './steps/MockedSushiSyncStep'
import { createMockedTransferStep } from './steps/MockedTransferStep'
import { createMockedTransferSyncStep } from './steps/MockedTransferSyncStep'
import { createRelayBzzSyncStep } from './steps/RelayBzzSyncStep'
import { createRelayToBzzStep } from './steps/RelayToBzzStep'
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
    totalDaiValue: FixedPointNumber
    bzzUsdValue: number
    temporaryAddress: `0x${string}`
    temporaryPrivateKey: `0x${string}`
    targetAddress: `0x${string}`
    sendTransactionAsync: SendTransactionSignature
    relayClient: RelayClient
    walletClient: WalletClient
    relayQuote: Execute
    mocked: boolean
    setMetadata: Dispatch<SetStateAction<Record<string, string>>>
}

export function createGnosisFundingFlow(options: FundingFlowOptions) {
    const solver = new Solver()

    if (options.mocked) {
        solver.addStep(createMockedDepositStep(options))
        solver.addStep(createMockedDepositSyncStep(options))
        solver.addStep(createMockedSushiStep(options))
        solver.addStep(createMockedSushiSyncStep(options))
        solver.addStep(createMockedTransferStep(options))
        solver.addStep(createMockedTransferSyncStep(options))
    } else {
        solver.addStep(createDepositStep(options))
        solver.addStep(createDepositSyncStep(options))
        solver.addStep(createSushiStep(options))
        solver.addStep(createSushiSyncStep(options))
        solver.addStep(createTransferStep(options))
        solver.addStep(createTransferSyncStep(options))
    }

    return solver
}

export function createOtherChainFundingFlow(options: FundingFlowOptions) {
    const solver = new Solver()
    if (options.mocked) {
        solver.addStep(createMockedRelayStep(options))
        solver.addStep(createMockedRelaySyncStep(options))
    } else {
        // Relay delivers the xBZZ and the gas top-up straight to the destination, so
        // there is nothing left to do on Gnosis.
        solver.addStep(createRelayToBzzStep(options))
        solver.addStep(createRelayBzzSyncStep(options))
    }
    return solver
}

interface CreateBatchFlowOptions extends FundingFlowOptions {
    batchAmount: string | bigint
    batchDepth: number
}

export function createGnosisCreateBatchFlow(options: CreateBatchFlowOptions) {
    const solver = new Solver()

    // The temporary wallet has to end up holding the xBZZ, because it is the wallet
    // that approves the spending and pays for the batch.
    const toTemporaryWallet = { ...options, targetAddress: options.temporaryAddress }

    if (options.mocked) {
        solver.addStep(createMockedDepositStep(options))
        solver.addStep(createMockedDepositSyncStep(options))
        solver.addStep(createMockedSushiStep(toTemporaryWallet))
        solver.addStep(createMockedSushiSyncStep(toTemporaryWallet))
        solver.addStep(createMockedApproveBzzStep(options))
        solver.addStep(createMockedCreateBatchStep(options))
        solver.addStep(createMockedTransferStep(options))
        solver.addStep(createMockedTransferSyncStep(options))
    } else {
        solver.addStep(createDepositStep(options))
        solver.addStep(createDepositSyncStep(options))
        solver.addStep(createSushiStep(toTemporaryWallet))
        solver.addStep(createSushiSyncStep(toTemporaryWallet))
        solver.addStep(createApproveBzzStep(options))
        solver.addStep(createCreateBatchStep(options))
        solver.addStep(createTransferStep(options))
        solver.addStep(createTransferSyncStep(options))
    }

    return solver
}

export function createOtherChainCreateBatchFlow(options: CreateBatchFlowOptions) {
    const solver = new Solver()

    // Relay delivers the xBZZ and the gas top-up to the temporary wallet, which then
    // pays for the batch and forwards the leftover xDAI to the destination.
    const toTemporaryWallet = {
        ...options,
        targetAddress: options.temporaryAddress,
        routesThroughTemporaryWallet: true
    }

    if (options.mocked) {
        solver.addStep(createMockedRelayStep(options))
        solver.addStep(createMockedRelaySyncStep(options))
        solver.addStep(createMockedApproveBzzStep(options))
        solver.addStep(createMockedCreateBatchStep(options))
        solver.addStep(createMockedTransferStep(options))
        solver.addStep(createMockedTransferSyncStep(options))
    } else {
        solver.addStep(createRelayToBzzStep(toTemporaryWallet))
        solver.addStep(createRelayBzzSyncStep(toTemporaryWallet))
        solver.addStep(createApproveBzzStep(options))
        solver.addStep(createCreateBatchStep(options))
        solver.addStep(createTransferStep(options))
        solver.addStep(createTransferSyncStep(options))
    }

    return solver
}
