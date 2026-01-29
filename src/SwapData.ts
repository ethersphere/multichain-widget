export interface SwapData {
    sessionKey: `0x${string}`
    temporaryAddress: `0x${string}`
    bzzAmount: number
    nativeAmount: number
    sourceAddress: `0x${string}` | string
    targetAddress: `0x${string}` | string
    batchDepth?: number
    batchAmount?: bigint
}
