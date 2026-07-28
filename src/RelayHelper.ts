import { GetQuoteParameters, RelayClient, Execute } from '@relayprotocol/relay-sdk'
import { Objects, System } from 'cafe-utility'

const MAX_RETRIES = 10

export async function getRelayQuoteWithRetries(relayClient: RelayClient, quoteConfiguration: GetQuoteParameters & { topupGas?: boolean; topupGasAmount?: string }) {

    // translate SDK param names → raw API param names, so we won't get any error with params
    
    const body = {
        user: quoteConfiguration.user,
        recipient: quoteConfiguration.recipient,
        originChainId: quoteConfiguration.chainId,
        destinationChainId: quoteConfiguration.toChainId,
        originCurrency: quoteConfiguration.currency,
        destinationCurrency: quoteConfiguration.toCurrency,
        amount: quoteConfiguration.amount,
        tradeType: quoteConfiguration.tradeType,
        referrer: 'localhost',
        topupGas: quoteConfiguration.topupGas,
        topupGasAmount: quoteConfiguration.topupGasAmount,
        explicitDeposit: true,
        useDepositAddress: false,
    }

    for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        try {
            const response = await fetch('https://api.relay.link/quote/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}))
                throw new Error(errBody?.message || `Quote request failed: ${response.status} ${response.statusText}`)
            }
            const quote = (await response.json()) as Execute

            return quote
        } catch (error: unknown) {
            if (!Objects.errorMatches(error, 'no routes found')) {
                throw error
            }
            await System.sleepMillis(500)
        }
    }
    return null
}
