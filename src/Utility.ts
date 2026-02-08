import { MultichainLibrary } from '@upcoming/multichain-library'
import { Cache, Dates, FixedPointNumber } from 'cafe-utility'

export function shortenHash(hash: string, length: number = 8): string {
    if (hash.length <= length * 2) {
        return hash
    }
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
}

export interface StampCost {
    bzz: FixedPointNumber
    amount: bigint
}

export function getStampCost(depth: number, days: number, storagePrice: bigint): StampCost {
    const amount = (BigInt(days * 86_400) / BigInt(5)) * storagePrice + 1n
    return {
        bzz: new FixedPointNumber(2n ** BigInt(depth) * BigInt(amount), 16),
        amount
    }
}

export function createPostageBatchDepthOptions(reservedSlots: number): {
    label: string
    value: string
}[] {
    const labels = ['44.35 kB', '6.61 MB', '111.18 MB', '682.21 MB', '2.58 GB', '7.67 GB', '19.78 GB', '46.69 GB']
    return labels.map((label, index) => ({
        label,
        value: (index + 17 + reservedSlots).toString()
    }))
}

export function getAmountForDays(days: number, pricePerBlock: bigint): bigint {
    const blockTime = 5n
    return (BigInt(days * 86_400) / blockTime) * pricePerBlock + 1n
}

export async function getStoragePrice(library: MultichainLibrary): Promise<bigint> {
    const pricePerBlock = await Cache.get<bigint>('storage-price', Dates.minutes(1), async () =>
        library.getStoragePriceGnosis()
    )
    return pricePerBlock
}
