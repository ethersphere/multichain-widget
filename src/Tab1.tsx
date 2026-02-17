import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Binary, Elliptic, Types } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { BatchControls } from './components/BatchControls'
import { FundingControls } from './components/FundingControls'
import { IntentInfo } from './components/IntentInfo'
import { InfoIcon } from './icons/InfoIcon'
import { Intent } from './Intent'
import { MultichainMode } from './MultichainMode'
import { MultichainTheme } from './MultichainTheme'
import { Button } from './primitives/Button'
import { LabelSpacing } from './primitives/LabelSpacing'
import { Span } from './primitives/Span'
import { TextInput } from './primitives/TextInput'
import { Typography } from './primitives/Typography'
import { SwapData } from './SwapData'

const LOCAL_STORAGE_KEY = 'multichain-session-key'
const MINIMUM_XBZZ = 0.5

interface Props {
    theme: MultichainTheme
    mode: MultichainMode
    library: MultichainLibrary
    intent: Intent
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
    setInitialChainId: Dispatch<SetStateAction<number | null>>
    bzzUsdPrice: number | null
}

export function Tab1({
    theme,
    mode,
    library,
    intent,
    setTab,
    swapData,
    setSwapData,
    setInitialChainId,
    bzzUsdPrice
}: Props) {
    const { address } = useAccount()
    const chainId = useChainId()

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
            <IntentInfo theme={theme} intent={intent} />
            <LabelSpacing theme={theme}>
                <Typography theme={theme} testId="target-address-input__label">
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
                    testId="target-address-input"
                />
            </LabelSpacing>
            {mode === 'funding' ? (
                <FundingControls theme={theme} swapData={swapData} setSwapData={setSwapData} />
            ) : mode === 'batch' ? (
                <BatchControls theme={theme} library={library} swapData={swapData} setSwapData={setSwapData} />
            ) : null}
            <ConnectButton chainStatus="none" showBalance={false} />
            <Button
                theme={theme}
                onClick={onConnect}
                disabled={
                    !address ||
                    !swapData.targetAddress ||
                    !hasEnoughBalance ||
                    malformedAddress ||
                    wrongChecksum ||
                    bzzUsdPrice === null
                }
                testId="continue"
            >
                Continue
            </Button>
            {!hasEnoughBalance && (
                <Typography theme={theme} testId="error-not-enough-bzz">
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *At least {MINIMUM_XBZZ} xBZZ is required to perform the swap.
                    </Span>
                </Typography>
            )}
            {malformedAddress && (
                <Typography theme={theme} testId="error-invalid-address">
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *Address is not a valid Ethereum address.
                    </Span>
                </Typography>
            )}
            {wrongChecksum && (
                <Typography theme={theme} testId="error-bad-address-checksum">
                    <Span theme={theme} color={theme.errorTextColor} small>
                        *Address has an invalid checksum. Please check and try again.
                    </Span>
                </Typography>
            )}

            <Button
                theme={theme}
                secondary
                onClick={onExport}
                testId="export-keys"
                tooltip="If swapping fails or is interrupted, you can export the helper private keys generated by this application and import them in your wallet manager later to recover your funds manually."
                icon={<InfoIcon />}
            >
                Export helper private keys
            </Button>
        </div>
    )
}
