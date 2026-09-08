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

// Relay requires an API key on its public API endpoints. As this is a browser widget, the key is
// necessarily shipped to the client; Relay issues these keys for public, rate-limited use.
export const relayApiKey = '8bb9afc9-ee43-4665-95d5-d9a15677d2fe'

export const relayApiHeaders: Record<string, string> = { 'x-api-key': relayApiKey }

export const configuredRelayChains = [mainnet, polygon, optimism, arbitrum, base, gnosis].map(
    convertViemChainToRelayChain
)

console.log('Relay chains', configuredRelayChains)
