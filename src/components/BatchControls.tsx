import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { NumberInput } from '../primitives/NumberInput'
import { Select } from '../primitives/Select'
import { Span } from '../primitives/Span'
import { Typography } from '../primitives/Typography'
import { createPostageBatchDepthOptions } from '../Utility'

interface Props {
    theme: MultichainTheme
    durationDays: number
    setDurationDays: (value: number) => void
    capacityDepth: number
    setCapacityDepth: (value: number) => void
}

export function BatchControls({ theme, durationDays, setDurationDays, capacityDepth, setCapacityDepth }: Props) {
    const url = new URL(window.location.href)
    const reservedSlots = url.searchParams.get('reservedSlots') ? Number(url.searchParams.get('reservedSlots')) : 0

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
                        options={createPostageBatchDepthOptions(reservedSlots)}
                        testId="capacity-depth-input"
                    />
                </LabelSpacing>
            </div>
        </div>
    )
}
