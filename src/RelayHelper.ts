import { CurrencyList } from '@relayprotocol/relay-kit-hooks'
import { Execute, GetQuoteParameters } from '@relayprotocol/relay-sdk'
import { Objects, System } from 'cafe-utility'
import { relayApiHeaders } from './Config'

const MAX_RETRIES = 10

export async function getRelayQuoteWithRetries(
    quoteConfiguration: GetQuoteParameters & { topupGas?: boolean; topupGasAmount?: string }
) {
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
        topupGas: quoteConfiguration.topupGas,
        topupGasAmount: quoteConfiguration.topupGasAmount,
        explicitDeposit: true,
        useDepositAddress: false
    }

    for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        try {
            const response = await fetch('https://api.relay.link/quote/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...relayApiHeaders
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_3000) // 30 seconds timeout
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

export async function getRelayTokenList(chainId: number): Promise<CurrencyList> {
    // the useTokenList hook does not forward headers to the API, so the request is made here,
    // in order to be able to send the API key

    const response = await fetch('https://api.relay.link/currencies/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...relayApiHeaders
        },
        body: JSON.stringify({ chainIds: [chainId] }),
        signal: AbortSignal.timeout(30_000)
    })
    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody?.message || `Token list request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as CurrencyList
}
