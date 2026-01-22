import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    color?: string
    small?: boolean
}

export function Span({ theme, children, color, small }: Props) {
    return (
        <span
            style={{
                color: color ?? theme.textColor,
                fontFamily: theme.fontFamily,
                fontSize: small ? theme.smallFontSize : theme.fontSize,
                fontWeight: theme.fontWeight
            }}
            className="multichain__text"
        >
            {children}
        </span>
    )
}
