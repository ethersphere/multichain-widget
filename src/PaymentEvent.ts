import { postToHost } from './HostMessage'

export type PaymentPhase = 'sent' | 'delivered'

interface Options {
    phase: PaymentPhase
    chainId: number
    txHash?: string
    // Omitted when the payment goes straight to the destination, so there is no
    // temporary wallet the funds could get stranded on.
    temporaryAddress?: `0x${string}`
    resumed?: boolean
}

/**
 * Tells the host that money is in flight: `sent` when the payment transaction
 * succeeded (point of no return), `delivered` when the funds arrived on the
 * temporary wallet. Posted on the same channel as the `batch` event.
 */
export function postPaymentEvent(options: Options) {
    const message = {
        event: 'payment',
        phase: options.phase,
        chainId: options.chainId,
        resumed: options.resumed ?? false,
        ...(options.txHash ? { txHash: options.txHash } : {}),
        ...(options.temporaryAddress ? { temporaryAddress: options.temporaryAddress } : {})
    }
    console.log('Payment event', message)
    postToHost(message)
}
