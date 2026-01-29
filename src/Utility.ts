import { MultichainLibrary } from '@upcoming/multichain-library'
import { Cache, Dates, FixedPointNumber } from 'cafe-utility'

export function shortenHash(hash: string, length: number = 8): string {
    if (hash.length <= length * 2) {
        return hash
    }
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
}

interface StampCost {
    bzz: FixedPointNumber
    amount: bigint
}

export async function getStampCost(library: MultichainLibrary, depth: number, days: number): Promise<StampCost> {
    const pricePerBlock = await Cache.get('storage-price', Dates.seconds(30), async () =>
        library.getStoragePriceGnosis()
    )
    const amount = (BigInt(days * 86_400) / BigInt(5)) * BigInt(pricePerBlock) + 1n
    return {
        bzz: new FixedPointNumber(2n ** BigInt(depth) * BigInt(amount), 16),
        amount
    }
}
