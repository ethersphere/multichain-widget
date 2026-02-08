import { MultichainLibrary } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { NumberInput } from '../primitives/NumberInput'
import { Select } from '../primitives/Select'
import { Span } from '../primitives/Span'
import { Typography } from '../primitives/Typography'
import { SwapData } from '../SwapData'
import { createPostageBatchDepthOptions, getAmountForDays, getStampCost, getStoragePrice } from '../Utility'

interface Props {
    theme: MultichainTheme
    library: MultichainLibrary
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
}

export function BatchControls({ theme, library, setSwapData }: Props) {
    const url = new URL(window.location.href)
    const reservedSlots = url.searchParams.get('reservedSlots') ? Number(url.searchParams.get('reservedSlots')) : 0

    const [capacityDepth, setCapacityDepth] = useState(19)
    const [durationDays, setDurationDays] = useState(7)

    useEffect(() => {
        getStoragePrice(library).then(storagePrice => {
            setSwapData(x => ({
                ...x,
                nativeAmount: 0.05,
                bzzAmount:
                    parseFloat(getStampCost(capacityDepth, durationDays, storagePrice).bzz.toDecimalString()) * 1.1, // 10% buffer
                batch: { amount: getAmountForDays(durationDays, storagePrice), depth: capacityDepth }
            }))
        })
    }, [library, capacityDepth, durationDays, setSwapData])

    return (
        <div className="multichain__row">
            <NumberInput
                label="Duration (days)"
                theme={theme}
                placeholder="7"
                max={365}
                min={1}
                value={durationDays}
                onChange={async event => setDurationDays(Number(event))}
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
                        onChange={async event => {
                            setCapacityDepth(Number(event))
                        }}
                        options={createPostageBatchDepthOptions(reservedSlots)}
                        testId="capacity-depth-input"
                    />
                </LabelSpacing>
            </div>
        </div>
    )
}
