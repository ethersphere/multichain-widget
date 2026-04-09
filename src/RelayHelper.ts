import { GetQuoteParameters, RelayClient } from '@relayprotocol/relay-sdk'
import { Objects, System } from 'cafe-utility'

const MAX_RETRIES = 10

export async function getRelayQuoteWithRetries(relayClient: RelayClient, quoteConfiguration: GetQuoteParameters) {
    for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        try {
            const quote = await relayClient.actions.getQuote(quoteConfiguration)
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
