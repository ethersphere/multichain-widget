import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    readOnly?: boolean
    testId: string
}

export function TextInput({ theme, value, onChange, placeholder, readOnly, testId }: Props) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange ? e => onChange(e.target.value) : undefined}
            readOnly={readOnly}
            className="multichain__input"
            style={{
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
            data-test-id={testId}
        />
    )
}
