import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    secondary?: boolean
    tooltip?: string
}

export function Button({ theme, onClick, disabled, children, secondary, tooltip }: Props) {
    return (
        <button
            className="multichain__button"
            onClick={onClick}
            disabled={disabled}
            style={{
                paddingTop: theme.buttonVerticalPadding,
                paddingBottom: theme.buttonVerticalPadding,
                paddingLeft: theme.buttonHorizontalPadding,
                paddingRight: theme.buttonHorizontalPadding,
                borderRadius: theme.borderRadius,
                backgroundColor: secondary ? theme.buttonSecondaryBackgroundColor : theme.buttonBackgroundColor,
                color: secondary ? theme.buttonSecondaryTextColor : theme.buttonTextColor,
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize,
                fontWeight: theme.fontWeight
            }}
            title={tooltip}
        >
            {children}
        </button>
    )
}
