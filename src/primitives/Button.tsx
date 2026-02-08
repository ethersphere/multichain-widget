import { ReactNode, useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    secondary?: boolean
    tooltip?: string
    icon?: ReactNode
    testId: string
}

export function Button({ theme, onClick, disabled, children, secondary, tooltip, testId, icon }: Props) {
    const [hovering, setHovering] = useState(false)

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
                fontWeight: theme.fontWeight,
                position: 'relative'
            }}
            data-test-id={testId}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
        >
            {children}
            {tooltip && (
                <span
                    className="multichain__tooltip"
                    style={{
                        borderRadius: theme.borderRadius,
                        opacity: hovering ? 1 : 0
                    }}
                >
                    <Typography theme={theme} testId={`${testId}_tooltip`} small>
                        {tooltip}
                    </Typography>
                </span>
            )}
            {icon && <span className="multichain__button-icon">{icon}</span>}
        </button>
    )
}
