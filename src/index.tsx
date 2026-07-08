import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { convertViemChainToRelayChain, createClient, MAINNET_RELAY_API } from '@relayprotocol/relay-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MultichainLibrary, MultichainLibrarySettings } from '@upcoming/multichain-library'
import { Objects } from 'cafe-utility'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import { config } from './Config'
import { Intent } from './Intent'
import { getDefaultHooks, MultichainHooks } from './MultichainHooks'
import { MultichainMode } from './MultichainMode'
import { getDefaultMultichainTheme, MultichainTheme } from './MultichainTheme'
import './MultichainWidget.css'
import { Router } from './Router'
import { getQueryParam } from './Utility'

const queryClient = new QueryClient()

interface Props {
    theme?: Partial<MultichainTheme>
    hooks?: Partial<MultichainHooks>
    settings?: Partial<MultichainLibrarySettings>
    intent?: Intent
    destination?: string
    dai?: number
    bzz?: number
}

createClient({
    baseApiUrl: MAINNET_RELAY_API,
    chains: [convertViemChainToRelayChain(mainnet)]
})

export function MultichainWidget({ theme, hooks, settings, intent, destination, dai, bzz }: Props) {
    const mergedTheme = Objects.deepMerge2(getDefaultMultichainTheme(), theme || {})
    const mergedHooks = Objects.deepMerge2(getDefaultHooks(), hooks || {})
    const library = new MultichainLibrary(settings)

    const queryParamDestination = getQueryParam('destination')
    const queryParamIntent = getQueryParam('intent').toLowerCase()
    const queryParamDai = getQueryParam('dai')
    const queryParamBzz = getQueryParam('bzz')
    const queryParamMode = getQueryParam('mode').toLowerCase()

    const resolvedDestination = destination ? destination : queryParamDestination ? queryParamDestination : ''
    const resolvedIntent: Intent = intent
        ? intent
        : queryParamIntent === 'initial-funding'
        ? 'initial-funding'
        : queryParamIntent === 'postage-batch'
        ? 'postage-batch'
        : 'arbitrary'
    const resolvedDai = dai ? dai : queryParamDai ? Number(queryParamDai) : 0.5
    const resolvedBzz = bzz ? bzz : queryParamBzz ? Number(queryParamBzz) : 10
    const resolvedMode: MultichainMode = queryParamMode === 'batch' ? 'batch' : 'funding'

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    <Router
                        theme={mergedTheme}
                        mode={resolvedMode}
                        hooks={mergedHooks}
                        library={library}
                        intent={resolvedIntent}
                        destination={resolvedDestination}
                        dai={resolvedDai}
                        bzz={resolvedBzz}
                    />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
