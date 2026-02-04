import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { Spinner } from '../primitives/Spinner'
import { Typography } from '../primitives/Typography'
import { StatusIndicator } from './StatusIndicator'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'
    testId: string
}

export function ProgressStatus({ theme, children, status, testId }: Props) {
    let symbol: ReactNode = <StatusIndicator color="#AAAAAA" testId={`${testId}__pending`} />
    if (status === 'skipped') {
        symbol = <StatusIndicator color="#FFDC00" testId={`${testId}__skipped`} />
    }
    if (status === 'completed') {
        symbol = <StatusIndicator color="#2ECC40" testId={`${testId}__completed`} />
    }
    if (status === 'in-progress') {
        symbol = <Spinner testId={`${testId}__in-progress`} />
    }
    if (status === 'failed') {
        symbol = <StatusIndicator color="#FF4136" testId={`${testId}__failed`} />
    }

    return (
        <div className="multichain__row" data-test-id={testId}>
            {symbol}
            <Typography theme={theme} testId={`${testId}__description`}>
                {children}
            </Typography>
        </div>
    )
}
