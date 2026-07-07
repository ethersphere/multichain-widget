import { GetQuoteParameters, RelayClient } from '@relayprotocol/relay-sdk'
import { Dates, System } from 'cafe-utility'

export async function getRelayQuoteWithRetries(relayClient: RelayClient, quoteConfiguration: GetQuoteParameters) {
    try {
        return await System.withRetries(
            () => relayClient.actions.getQuote(quoteConfiguration),
            10,
            Dates.seconds(1),
            Dates.seconds(5),
            console.error
        )
    } catch {
        return null
    }
}
