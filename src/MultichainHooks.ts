export interface MultichainHooks {
    beforeTransactionStart: (temporaryPrivateKey: string) => Promise<void>
    onFatalError: (error: unknown) => Promise<void>
    onCompletion: () => Promise<void>
    onUserAbort: () => Promise<void>
}

export function getDefaultHooks(): MultichainHooks {
    return {
        beforeTransactionStart: async (_temporaryPrivateKey: string) => {
            void 0
        },
        onFatalError: async (error: unknown) => {
            console.error('A fatal error occurred during the multichain transaction:', error)
        },
        onCompletion: async () => {
            console.log('Multichain transaction completed successfully!')
        },
        onUserAbort: async () => {
            console.log('Multichain transaction was aborted by the user.')
        }
    }
}
