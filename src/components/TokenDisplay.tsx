import { MultichainTheme } from '../MultichainTheme'
import { Typography } from '../primitives/Typography'

interface Props {
    theme: MultichainTheme
    leftLabel: string
    rightLabel: string
    testId: string
}

export function TokenDisplay({ theme, leftLabel, rightLabel, testId }: Props) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: theme.inputVerticalPadding,
                paddingBottom: theme.inputVerticalPadding,
                paddingLeft: theme.inputHorizontalPadding,
                paddingRight: theme.inputHorizontalPadding,
                borderRadius: theme.borderRadius,
                backgroundColor: theme.inputBackgroundColor,
                borderColor: theme.inputBorderColor,
                color: theme.inputTextColor,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize,
                fontWeight: theme.fontWeight
            }}
        >
            <Typography theme={theme} testId={`${testId}__left`}>
                {leftLabel}
            </Typography>
            <Typography theme={theme} testId={`${testId}__right`} small secondary>
                {rightLabel}
            </Typography>
        </div>
    )
}
