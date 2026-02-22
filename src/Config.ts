import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { convertViemChainToRelayChain } from '@relayprotocol/relay-sdk'
import { fallback, http } from 'viem'
import { arbitrum, base, gnosis, mainnet, optimism, polygon } from 'viem/chains'
import { Config } from 'wagmi'

export const config: Config = getDefaultConfig({
    appName: 'Multichain Library',
    projectId: '5119e426ef93d637395e119c5169ad79',
    chains: [mainnet, polygon, optimism, arbitrum, base, gnosis],
    ssr: false,
    transports: {
        [mainnet.id]: fallback([http('https://ethereum-rpc.publicnode.com'), http()]),
        [polygon.id]: fallback([http('https://polygon.drpc.org'), http()]),
        [optimism.id]: fallback([http()]),
        [arbitrum.id]: fallback([http()]),
        [base.id]: fallback([http()]),
        [gnosis.id]: fallback([http('https://xdai.fairdatasociety.org'), http()])
    }
})

export const configuredRelayChains = [mainnet, polygon, optimism, arbitrum, base, gnosis].map(
    convertViemChainToRelayChain
)
