import { MultichainTheme } from '../MultichainTheme'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    isLoading: boolean
    quote: unknown | null
}

export function QuoteIndicator({ theme, isLoading, quote }: Props) {
    return isLoading ? (
        <ProgressStatus theme={theme} status="in-progress">
            Loading quote...
        </ProgressStatus>
    ) : quote ? (
        <ProgressStatus theme={theme} status="completed">
            Quote available
        </ProgressStatus>
    ) : (
        <ProgressStatus theme={theme} status="failed">
            Quote unavailable - amount is either too small, large, or the token is illiquid
        </ProgressStatus>
    )
}
