import { useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from './LabelSpacing'
import { Span } from './Span'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    label: string
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    placeholder: string
    testId: string
}

export function NumberInput({ theme, label, value, onChange, min, max, placeholder, testId }: Props) {
    const [textValue, setTextValue] = useState<string>(value.toString())
    const [errorText, setErrorText] = useState<string | null>(null)

    function normalizedOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        let raw = event.target.value
        while (raw.startsWith('0') && raw.length > 1 && !['.'].includes(raw[1])) {
            raw = raw.substring(1)
        }
        let number = Number(raw)
        if (isNaN(number)) {
            setTextValue(value.toString())
            return
        }
        setTextValue(raw)
        if (number > max) {
            number = max
            setTextValue(number.toString())
            setErrorText(`Maximum value is ${max}`)
        } else if (number < min) {
            number = min
            setTextValue(number.toString())
            setErrorText(`Minimum value is ${min}`)
        } else {
            setErrorText(null)
        }
        onChange(number)
    }

    return (
        <div className="multichain__column multichain__column--full">
            <LabelSpacing theme={theme}>
                <Typography theme={theme} testId={`${testId}__label`}>
                    {label}
                    <Span theme={theme} color={theme.buttonBackgroundColor}>
                        *
                    </Span>
                    {errorText && (
                        <Span theme={theme} small color={theme.errorTextColor}>
                            {' '}
                            {errorText}
                        </Span>
                    )}
                </Typography>
                <input
                    placeholder={placeholder}
                    value={textValue}
                    onChange={event => normalizedOnChange(event)}
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
            </LabelSpacing>
        </div>
    )
}
