import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    progress: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>
    metadata: Record<string, string>
    isOtherChain?: boolean
}

export function CreateBatchProgressTracker({ theme, progress, metadata, isOtherChain }: Props) {
    if (isOtherChain) {
        return (
            <LabelSpacing theme={theme}>
                <ProgressStatus theme={theme} status={progress.relay} testId="status-step-1" tx={metadata.relay}>
                    Cross-Swapping with Relay
                </ProgressStatus>
                <ProgressStatus theme={theme} status={progress['relay-sync']} testId="status-step-2">
                    Sync
                </ProgressStatus>
                <ProgressStatus
                    theme={theme}
                    status={progress['approve-bzz']}
                    testId="status-step-3"
                    tx={metadata.approve}
                >
                    Approve xBZZ spending
                </ProgressStatus>
                <ProgressStatus
                    theme={theme}
                    status={progress['create-batch']}
                    testId="status-step-4"
                    tx={metadata.batch}
                >
                    Create Postage Batch
                </ProgressStatus>
                <ProgressStatus theme={theme} status={progress.transfer} testId="status-step-5" tx={metadata.transfer}>
                    Transfer leftover xDAI
                </ProgressStatus>
                <ProgressStatus theme={theme} status={progress['transfer-sync']} testId="status-step-6">
                    Sync
                </ProgressStatus>
            </LabelSpacing>
        )
    }
    return (
        <LabelSpacing theme={theme}>
            <ProgressStatus theme={theme} status={progress.deposit} testId="status-step-1" tx={metadata.deposit}>
                Depositing xDAI
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['deposit-sync']} testId="status-step-2">
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.sushi} testId="status-step-3" tx={metadata.sushi}>
                Swap xDAI to xBZZ on Sushi
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['sushi-sync']} testId="status-step-4">
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['approve-bzz']} testId="status-step-5" tx={metadata.approve}>
                Approve xBZZ spending
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['create-batch']} testId="status-step-6" tx={metadata.batch}>
                Create Postage Batch
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.transfer} testId="status-step-7" tx={metadata.transfer}>
                Transfer leftover xDAI
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['transfer-sync']} testId="status-step-8">
                Sync
            </ProgressStatus>
        </LabelSpacing>
    )
}
