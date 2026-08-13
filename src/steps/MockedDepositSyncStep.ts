import { System } from 'cafe-utility'

export function createMockedDepositSyncStep() {
    return {
        name: 'deposit-sync',
        action: async () => {
            await System.sleepMillis(1000)
        }
    }
}
