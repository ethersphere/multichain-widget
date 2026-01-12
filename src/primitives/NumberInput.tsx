import { Numbers } from 'cafe-utility'
import { useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    placeholder: string
}

export function NumberInput({ theme, value, onChange, min, max, placeholder }: Props) {
    const [textValue, setTextValue] = useState<string>(value.toString())

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
        number = Numbers.clamp(number, min, max)
        onChange(number)
    }

    return (
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
        />
    )
}
