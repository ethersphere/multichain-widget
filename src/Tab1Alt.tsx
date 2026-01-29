import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Binary, Elliptic, Types } from 'cafe-utility'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { IntentInfo } from './components/IntentInfo'
import { MultichainTheme } from './MultichainTheme'
import { Button } from './primitives/Button'
import { LabelSpacing } from './primitives/LabelSpacing'
import { NumberInput } from './primitives/NumberInput'
import { Select } from './primitives/Select'
import { Span } from './primitives/Span'
import { TextInput } from './primitives/TextInput'
import { Typography } from './primitives/Typography'
import { SwapData } from './SwapData'
import { getStampCost } from './Utility'

const LOCAL_STORAGE_KEY = 'multichain-session-key'
const MINIMUM_XBZZ = 0.5

interface Props {
    library: MultichainLibrary
    theme: MultichainTheme
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
    setInitialChainId: Dispatch<SetStateAction<number | null>>
}

export function Tab1Alt({ library, theme, setTab, swapData, setSwapData, setInitialChainId }: Props) {
    const { address } = useAccount()
    const chainId = useChainId()
    const [durationDays, setDurationDays] = useState<number>(1)
    const [capacityDepth, setCapacityDepth] = useState<number>(19)

    useEffect(() => {
        getStampCost(library, capacityDepth, durationDays).then(async stampCost =>
            setSwapData(x => ({
                ...x,
                batchAmount: stampCost.amount,
                batchDepth: capacityDepth,
                bzzAmount: parseFloat(stampCost.bzz.toDecimalString()) * 1.1,
                nativeAmount: 0.05
            }))
        )
    }, [durationDays, capacityDepth])

    const hasEnoughBalance = swapData.bzzAmount >= MINIMUM_XBZZ
    let malformedAddress = false
    let wrongChecksum = false

    if (swapData.targetAddress) {
        try {
            malformedAddress = true
            const cleanAddress = Types.asHexString(swapData.targetAddress, { byteLength: 20 })
            malformedAddress = false
            if (cleanAddress.match(/[A-F]/)) {
                const checksummed = Elliptic.checksumEncode(Binary.hexToUint8Array(cleanAddress))
                wrongChecksum = checksummed !== swapData.targetAddress
            }
        } catch (e) {}
    }

    function onConnect() {
        if (address && swapData.targetAddress) {
            if (!chainId) {
                alert('Cannot detect connected chain ID.')
                return
            }
            setSwapData(x => ({ ...x, sourceAddress: Types.asHexString(address) }))
            setInitialChainId(chainId)
            setTab(2)
        }
    }

    function onExport() {
        const keys: { privateKey: string; date: string }[] = []
        for (const key in localStorage) {
            if (key.startsWith(`${LOCAL_STORAGE_KEY}_`)) {
                const [_, millis] = key.split('_')
                const privateKey = localStorage.getItem(key)
                if (privateKey) {
                    keys.push({ privateKey, date: new Date(Number(millis)).toLocaleString() })
                }
            }
        }
        if (!keys.length) {
            alert('No session keys found in local storage.')
            return
        }
        const blob = new Blob([JSON.stringify(keys, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'multichain-private-keys.json'
        a.click()
    }

    return (
        <div
            className="multichain__wrapper"
            style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
        >
            <IntentInfo theme={theme} intent="postage-batch" />
            <LabelSpacing theme={theme}>
                <Typography theme={theme}>
                    Target Address
                    <Span theme={theme} color={theme.buttonBackgroundColor}>
                        *
                    </Span>
                </Typography>
                <TextInput
                    theme={theme}
                    placeholder="0x..."
                    value={swapData.targetAddress}
                    onChange={e => setSwapData(x => ({ ...x, targetAddress: e }))}
                />
            </LabelSpacing>
            <div className="multichain__row">
                <NumberInput
                    label="Duration (days)"
                    theme={theme}
                    placeholder="7"
                    max={30}
                    min={0}
                    value={durationDays}
                    onChange={event => setDurationDays(event)}
                />
                <div className="multichain__column multichain__column--full">
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme}>
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
                        />
                    </LabelSpacing>
                </div>
            </div>
            <Typography theme={theme}>Estimated xBZZ required: {swapData.bzzAmount.toFixed(6)} xBZZ</Typography>
            <ConnectButton />
            <Button
                theme={theme}
                onClick={onConnect}
                disabled={!address || !swapData.targetAddress || !hasEnoughBalance || malformedAddress || wrongChecksum}
            >
                Continue
            </Button>
            {!hasEnoughBalance && (
                <Typography theme={theme}>
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *At least {MINIMUM_XBZZ} xBZZ is required to perform the swap.
                    </Span>
                </Typography>
            )}
            {malformedAddress && (
                <Typography theme={theme}>
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *Address is not a valid Ethereum address.
                    </Span>
                </Typography>
            )}
            {wrongChecksum && (
                <Typography theme={theme}>
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *Address has an invalid checksum. Please check and try again.
                    </Span>
                </Typography>
            )}
            <Button
                theme={theme}
                secondary
                onClick={onExport}
                tooltip="If swapping fails or is interrupted, you can export the temporary private keys generated by this application and import them in your wallet manager later to recover your funds manually."
            >
                Export temporary private keys
            </Button>
        </div>
    )
}
