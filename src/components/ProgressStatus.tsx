import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { Spinner } from '../primitives/Spinner'
import { Typography } from '../primitives/Typography'
import { StatusIndicator } from './StatusIndicator'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'
}

export function ProgressStatus({ theme, children, status }: Props) {
    let symbol: ReactNode = <StatusIndicator color="#AAAAAA" />
    if (status === 'skipped') {
        symbol = <StatusIndicator color="#FFDC00" />
    }
    if (status === 'completed') {
        symbol = <StatusIndicator color="#2ECC40" />
    }
    if (status === 'in-progress') {
        symbol = <Spinner />
    }
    if (status === 'failed') {
        symbol = <StatusIndicator color="#FF4136" />
    }

    return (
        <div className="multichain__row">
            {symbol}
            <Typography theme={theme}>{children}</Typography>
        </div>
    )
}
