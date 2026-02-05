import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { convertViemChainToRelayChain } from '@relayprotocol/relay-sdk'
import { arbitrum, base, gnosis, mainnet, optimism, polygon } from 'viem/chains'
import { Config } from 'wagmi'

export const config: Config = getDefaultConfig({
    appName: 'Multichain Library',
    projectId: '5119e426ef93d637395e119c5169ad79',
    chains: [mainnet, polygon, optimism, arbitrum, base, gnosis],
    ssr: false
})

export const configuredRelayChains = [mainnet, polygon, optimism, arbitrum, base, gnosis].map(
    convertViemChainToRelayChain
)
