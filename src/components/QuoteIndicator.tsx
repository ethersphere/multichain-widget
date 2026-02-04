import { MultichainTheme } from '../MultichainTheme'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    isLoading: boolean
    quote: unknown | null
    testId: string
}

export function QuoteIndicator({ theme, isLoading, quote, testId }: Props) {
    return isLoading ? (
        <ProgressStatus theme={theme} status="in-progress" testId={testId}>
            Loading quote...
        </ProgressStatus>
    ) : quote ? (
        <ProgressStatus theme={theme} status="completed" testId={testId}>
            Quote available
        </ProgressStatus>
    ) : (
        <ProgressStatus theme={theme} status="failed" testId={testId}>
            Quote unavailable - amount is either too small, large, or the token is illiquid
        </ProgressStatus>
    )
}
