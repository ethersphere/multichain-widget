import { Dates, Lock } from 'cafe-utility'

export function createLock(): Lock {
    return new Lock({
        lockFunction: async (storable: string) => {
            localStorage.setItem('lock', storable)
        },
        unlockFunction: async () => {
            localStorage.removeItem('lock')
        },
        queryFunction: async () => {
            return localStorage.getItem('lock') ?? ''
        },
        timeoutMillis: Dates.minutes(3)
    })
}
