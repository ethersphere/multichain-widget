import { MultichainLibrary } from '@upcoming/multichain-library'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { LabelSpacing } from '../primitives/LabelSpacing'
import { NumberInput } from '../primitives/NumberInput'
import { Select } from '../primitives/Select'
import { Span } from '../primitives/Span'
import { Typography } from '../primitives/Typography'
import { SwapData } from '../SwapData'
import {
    createPostageBatchDepthOptions,
    getAmountForDays,
    getDaysForAmount,
    getQueryParam,
    getStampCost,
    getStoragePrice,
    hasQueryParam
} from '../Utility'

interface Props {
    theme: MultichainTheme
    library: MultichainLibrary
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
}

const MAX_DURATION_DAYS = 365

export function BatchControls({ theme, library, setSwapData }: Props) {
    const reservedSlots = hasQueryParam('reserved-slots') ? Number(getQueryParam('reserved-slots')) : 0
    const depthOptions = createPostageBatchDepthOptions(reservedSlots)

    // The host may seed both controls: `depth` directly, `amount` (PLUR per chunk) as the duration it funds
    // at the current storage price. They are only defaults — the user can still change them here, and the
    // `batch` event carries what was actually bought.
    const queryDepth = getQueryParam('depth')
    const queryAmount = getQueryParam('amount')

    const [capacityDepth, setCapacityDepth] = useState(
        depthOptions.some(x => x.value === queryDepth) ? Number(queryDepth) : 19 + reservedSlots
    )
    const [durationDays, setDurationDays] = useState(7)

    useEffect(() => {
        if (!/^\d+$/.test(queryAmount)) {
            return
        }
        getStoragePrice(library).then(storagePrice => {
            const days = getDaysForAmount(BigInt(queryAmount), storagePrice)
            if (days >= 1) {
                setDurationDays(Math.min(days, MAX_DURATION_DAYS))
            }
        })
    }, [library, queryAmount])

    useEffect(() => {
        getStoragePrice(library).then(storagePrice => {
            setSwapData(x => ({
                ...x,
                nativeAmount: 0.05,
                bzzAmount: getStampCost(capacityDepth, durationDays, storagePrice).bzz.toFloat() * 1.2, // 20% buffer
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
                max={MAX_DURATION_DAYS}
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
                        options={depthOptions}
                        testId="capacity-depth-input"
                    />
                </LabelSpacing>
            </div>
        </div>
    )
}
