import { MultichainLibrary } from '@upcoming/multichain-library'
import { Binary, Elliptic, Strings, Types } from 'cafe-utility'
import { useState } from 'react'
import { Intent } from './Intent'
import { MultichainHooks } from './MultichainHooks'
import { MultichainMode } from './MultichainMode'
import { MultichainTheme } from './MultichainTheme'
import { SwapData } from './SwapData'
import { Tab1 } from './Tab1'
import { Tab2 } from './Tab2'

const LOCAL_STORAGE_KEY = 'multichain-session-key'

interface Props {
    theme: MultichainTheme
    mode: MultichainMode
    hooks: MultichainHooks
    library: MultichainLibrary
    intent: Intent
    destination: string
    dai: number
    bzz: number
}

export function Router({ theme, mode, hooks, library, intent, destination, dai, bzz }: Props) {
    const sessionKey = Types.asHexString(localStorage.getItem(LOCAL_STORAGE_KEY) || Strings.randomHex(64))
    if (localStorage.getItem(LOCAL_STORAGE_KEY) !== sessionKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, sessionKey)
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${Date.now()}`, sessionKey)
    }

    const [swapData, setSwapData] = useState<SwapData>({
        bzzAmount: bzz,
        nativeAmount: dai,
        sourceAddress: '',
        targetAddress: Types.isHexString(destination) ? Types.asHexString(destination, { uneven: true }) : destination,
        sessionKey,
        temporaryAddress: Types.asHexString(
            Binary.uint8ArrayToHex(
                Elliptic.publicKeyToAddress(
                    Elliptic.privateKeyToPublicKey(Binary.uint256ToNumber(Binary.hexToUint8Array(sessionKey), 'BE'))
                )
            )
        )
    })
    const [tab, setTab] = useState<1 | 2>(1)
    const [initialChainId, setInitialChainId] = useState<number | null>(null)

    if (tab === 1 || initialChainId === null) {
        return (
            <Tab1
                mode={mode}
                setTab={setTab}
                theme={theme}
                library={library}
                intent={intent}
                swapData={swapData}
                setSwapData={setSwapData}
                setInitialChainId={setInitialChainId}
            />
        )
    }

    return (
        <Tab2
            mode={mode}
            setTab={setTab}
            theme={theme}
            hooks={hooks}
            swapData={swapData}
            initialChainId={initialChainId}
            library={library}
        />
    )
}
