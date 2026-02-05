import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { NumberInput } from '../primitives/NumberInput'
import { Select } from '../primitives/Select'
import { Span } from '../primitives/Span'
import { Typography } from '../primitives/Typography'

interface Props {
    theme: MultichainTheme
    durationDays: number
    setDurationDays: (value: number) => void
    capacityDepth: number
    setCapacityDepth: (value: number) => void
}

export function BatchControls({ theme, durationDays, setDurationDays, capacityDepth, setCapacityDepth }: Props) {
    return (
        <div className="multichain__row">
            <NumberInput
                label="Duration (days)"
                theme={theme}
                placeholder="7"
                max={365}
                min={1}
                value={durationDays}
                onChange={event => setDurationDays(event)}
                testId="duration-days-input"
            />
            <div className="multichain__column multichain__column--full">
                <LabelSpacing theme={theme}>
                    <Typography theme={theme} testId="capacity-depth-input__label">
                        Capacity
                        <Span theme={theme} color={theme.buttonBackgroundColor}>
                            *
                        </Span>
                    </Typography>
                    <Select
                        theme={theme}
                        value={capacityDepth.toString()}
                        onChange={value => setCapacityDepth(Number(value))}
                        options={[
                            { label: '44.35 kB', value: '19' },
                            { label: '6.61 MB', value: '20' },
                            { label: '111.18 MB', value: '21' },
                            { label: '682.21 MB', value: '22' },
                            { label: '2.58 GB', value: '23' }
                        ]}
                        testId="capacity-depth-input"
                    />
                </LabelSpacing>
            </div>
        </div>
    )
}
