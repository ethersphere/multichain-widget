import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    progress: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>
}

export function CreateBatchProgressTracker({ theme, progress }: Props) {
    return (
        <LabelSpacing theme={theme}>
            <ProgressStatus theme={theme} status={progress.relay} testId="status-step-1">
                Cross-swap to xDAI on Relay
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['relay-sync']} testId="status-step-2">
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.sushi} testId="status-step-3">
                Swap xDAI to xBZZ on Sushi
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['sushi-sync']} testId="status-step-4">
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['approve-bzz']} testId="status-step-5">
                Approve xBZZ spending
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['create-batch']} testId="status-step-6">
                Create Postage Batch
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.transfer} testId="status-step-7">
                Transfer leftover xDAI
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['transfer-sync']} testId="status-step-8">
                Sync
            </ProgressStatus>
        </LabelSpacing>
    )
}
