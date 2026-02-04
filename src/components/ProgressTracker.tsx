import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    progress: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>
}

export function ProgressTracker({ theme, progress }: Props) {
    return (
        <LabelSpacing theme={theme}>
            <ProgressStatus theme={theme} status={progress.relay}>
                Cross-swap to xDAI on Relay
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['relay-sync']}>
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.sushi}>
                Swap xDAI to xBZZ on Sushi
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['sushi-sync']}>
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.transfer}>
                Transfer leftover xDAI
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['transfer-sync']}>
                Sync
            </ProgressStatus>
        </LabelSpacing>
    )
}
