import { Dispatch, SetStateAction } from 'react'
import { MultichainTheme } from '../MultichainTheme'
import { NumberInput } from '../primitives/NumberInput'
import { SwapData } from '../SwapData'

interface Props {
    theme: MultichainTheme
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
}

export function FundingControls({ theme, swapData, setSwapData }: Props) {
    return (
        <div className="multichain__row">
            <NumberInput
                label="xDAI"
                theme={theme}
                placeholder="0.5"
                max={10}
                min={0}
                value={swapData.nativeAmount}
                onChange={e => setSwapData(x => ({ ...x, nativeAmount: e }))}
                testId="xdai-input"
            />
            <NumberInput
                label="xBZZ"
                theme={theme}
                placeholder="10"
                max={200}
                min={0}
                value={swapData.bzzAmount}
                onChange={e => setSwapData(x => ({ ...x, bzzAmount: Number(e) }))}
                testId="xbzz-input"
            />
        </div>
    )
}
