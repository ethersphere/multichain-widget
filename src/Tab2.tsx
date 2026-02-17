import { useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { createClient, Execute } from '@relayprotocol/relay-sdk'
import { MultichainLibrary, xBZZ, xDAI } from '@upcoming/multichain-library'
import { Arrays, Cache, Dates, FixedPointNumber, Numbers, Objects, Solver, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useChains, useSendTransaction, useSwitchChain, useWalletClient } from 'wagmi'
import { getBalance } from 'wagmi/actions'
import { CreateBatchProgressTracker } from './components/CreateBatchProgressTracker'
import { FundingProgressTracker } from './components/FundingProgressTracker'
import { QuoteIndicator } from './components/QuoteIndicator'
import { TokenDisplay } from './components/TokenDisplay'
import { config, configuredRelayChains } from './Config'
import { createCreateBatchFlow, createFundingFlow } from './Flow'
import { AlertIcon } from './icons/AlertIcon'
import { createLock } from './Lock'
import { MultichainHooks } from './MultichainHooks'
import { MultichainMode } from './MultichainMode'
import { MultichainTheme } from './MultichainTheme'
import { AdvancedSelect } from './primitives/AdvancedSelect'
import { Button } from './primitives/Button'
import { LabelSpacing } from './primitives/LabelSpacing'
import { Span } from './primitives/Span'
import { TextInput } from './primitives/TextInput'
import { Typography } from './primitives/Typography'
import { SwapData } from './SwapData'
import { getQueryParam, shortenHash } from './Utility'

interface Props {
    theme: MultichainTheme
    mode: MultichainMode
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    initialChainId: number
    library: MultichainLibrary
    bzzUsdPrice: number
}

interface Balance {
    symbol: string
    decimals: number
    value: bigint
}

export function Tab2({ theme, mode, hooks, setTab, swapData, initialChainId, library, bzzUsdPrice }: Props) {
    // states for user input
    const [sourceChain, setSourceChain] = useState<number>(initialChainId)
    const [sourceToken, setSourceToken] = useState<string>(library.constants.nullAddress)

    // states for network data
    const [selectedTokenBalance, setSelectedTokenBalance] = useState<Balance | null>(null)
    const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<number | null>(null)

    // quote state
    const [loadingRelayQuote, setLoadingRelayQuote] = useState<boolean>(true)
    const [relayQuote, setRelayQuote] = useState<Execute | null>(null)

    // states for flow status
    const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'failed'>('pending')
    const [stepStates, setStepStates] = useState<
        Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>
    >({})

    // relay and wagmi hooks
    const relayClient = createClient({ chains: configuredRelayChains })
    const walletClient = useWalletClient()
    const { chains: relayChains } = useRelayChains()
    const configuredChains = useChains()
    const chains =
        relayChains && configuredChains ? relayChains.filter(x => configuredChains.some(y => x.id === y.id)) : []
    const { data: tokenList } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })
    const { switchChainAsync } = useSwitchChain()

    // computed
    const currencyIn = relayQuote?.details?.currencyIn
    const selectedTokenAmountNeeded =
        currencyIn?.amount && currencyIn.currency?.decimals
            ? new FixedPointNumber(currencyIn?.amount, currencyIn?.currency?.decimals)
            : null
    const sourceChainDisplayName = chains.find(x => x.id === sourceChain)?.displayName || 'N/A'
    const sourceTokenObject = (tokenList || []).find(x => x.address === sourceToken)
    const sourceTokenDisplayName = sourceTokenObject ? sourceTokenObject.symbol : 'N/A'
    const neededBzzAmount = xBZZ.fromFloat(swapData.bzzAmount)
    const neededDaiUsdValue = swapData.nativeAmount + library.constants.daiDustAmount.toFloat()
    const neededBzzUsdValue = neededBzzAmount.toFloat() * bzzUsdPrice
    const totalNeededUsdValue = (neededBzzUsdValue + neededDaiUsdValue) * 1.1 // +10% slippage
    const hasSufficientBalance =
        selectedTokenBalance && selectedTokenAmountNeeded
            ? selectedTokenBalance.value >= selectedTokenAmountNeeded.value
            : true

    // send transaction hook in case of xdai source token
    const { sendTransactionAsync } = useSendTransaction()

    // watch selected token price, balance and quote
    useEffect(() => {
        if (!sourceToken) {
            return
        }

        return Arrays.multicall([
            System.runAndSetInterval(() => {
                library
                    .getTokenPrice(sourceToken as `0x${string}`, sourceChain)
                    .then(price => setSelectedTokenUsdPrice(price))
                    .catch(error => {
                        console.error('Error fetching selected token price:', error)
                    })
            }, Dates.minutes(1)),
            System.runAndSetInterval(async () => {
                try {
                    const token =
                        sourceToken === library.constants.nullAddress ? undefined : (sourceToken as `0x${string}`)
                    const cacheKey = `${swapData.sourceAddress}-${sourceChain}-${token}`
                    const balance = await Cache.get(cacheKey, Dates.minutes(1), async () =>
                        getBalance(config, {
                            address: swapData.sourceAddress as `0x${string}`,
                            token,
                            chainId: sourceChain
                        })
                    )
                    setSelectedTokenBalance(balance)
                } catch (error) {
                    console.error('Error fetching selected token balance:', error)
                }
            }, Dates.minutes(1)),
            System.runAndSetInterval(async () => {
                const neededBzzAmount = xBZZ.fromFloat(swapData.bzzAmount)
                const neededDaiUsdValue = swapData.nativeAmount + library.constants.daiDustAmount.toFloat()
                const neededBzzUsdValue = neededBzzAmount.toFloat() * bzzUsdPrice
                const totalNeededUsdValue = (neededBzzUsdValue + neededDaiUsdValue) * 1.1 // +10% slippage
                const quoteConfiguration = {
                    user: swapData.sourceAddress,
                    recipient: swapData.temporaryAddress,
                    chainId: sourceChain,
                    toChainId: library.constants.gnosisChainId,
                    currency: sourceToken,
                    toCurrency: library.constants.nullAddress, // xDAI
                    tradeType: 'EXACT_OUTPUT' as const,
                    amount: xDAI.fromFloat(totalNeededUsdValue).toString()
                }
                const quote = await Cache.get(JSON.stringify(quoteConfiguration), Dates.minutes(1), async () => {
                    setRelayQuote(null)
                    setLoadingRelayQuote(true)
                    try {
                        const quote = await relayClient.actions.getQuote(quoteConfiguration)
                        return quote
                    } catch (error: unknown) {
                        if (Objects.errorMatches(error, 'no routes found')) {
                            return null
                        } else {
                            throw error
                        }
                    }
                })
                setRelayQuote(quote)
                setLoadingRelayQuote(false)
            }, Dates.seconds(2))
        ])
    }, [
        sourceChain,
        sourceToken,
        setRelayQuote,
        setLoadingRelayQuote,
        setSelectedTokenUsdPrice,
        setSelectedTokenBalance
    ])

    function onBack() {
        setTab(1)
    }

    async function onSwapWithErrorHandling() {
        try {
            await onSwap()
        } catch (error: unknown) {
            if (Objects.errorMatches(error, 'User rejected the request.')) {
                hooks.onUserAbort().then(() => {
                    setTab(1)
                })
            } else {
                console.error('Swap failed:', error)
            }
        }
    }

    // main action
    async function onSwap() {
        if (!neededBzzUsdValue) {
            console.error('BZZ price not loaded yet')
            return
        }

        if (!relayQuote) {
            console.error('Relay quote not loaded yet')
            return
        }

        if (!selectedTokenAmountNeeded) {
            console.error('Selected token amount needed not calculated yet')
            return
        }

        if (!walletClient.data) {
            console.error('Wallet client not available')
            return
        }

        let solver: Solver

        const beforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = ''
        }

        window.addEventListener('beforeunload', beforeUnload)

        const mocked = getQueryParam('mocked') === 'true'

        if (mode === 'funding') {
            solver = createFundingFlow({
                library,
                relayQuote,
                sourceChain,
                sourceToken,
                sourceTokenAmount: selectedTokenAmountNeeded,
                sendTransactionAsync,
                targetAddress: Types.asHexString(swapData.targetAddress),
                temporaryAddress: Types.asHexString(swapData.temporaryAddress),
                temporaryPrivateKey: Types.asHexString(swapData.sessionKey),
                bzzUsdValue: neededBzzUsdValue,
                totalDaiValue: xDAI.fromFloat(totalNeededUsdValue),
                relayClient,
                walletClient: walletClient.data,
                mocked
            })
        } else if (mode === 'batch') {
            if (!swapData.batch) {
                console.error('Batch parameters not set')
                alert('Batch parameters not set')
                return
            }
            solver = createCreateBatchFlow({
                library,
                relayQuote,
                sourceChain,
                sourceToken,
                sourceTokenAmount: selectedTokenAmountNeeded,
                sendTransactionAsync,
                targetAddress: Types.asHexString(swapData.targetAddress),
                temporaryAddress: Types.asHexString(swapData.temporaryAddress),
                temporaryPrivateKey: Types.asHexString(swapData.sessionKey),
                bzzUsdValue: neededBzzUsdValue,
                totalDaiValue: xDAI.fromFloat(totalNeededUsdValue),
                relayClient,
                walletClient: walletClient.data,
                batchAmount: swapData.batch.amount,
                batchDepth: swapData.batch.depth,
                mocked
            })
        } else {
            console.error('Invalid mode, no solver available')
            alert('Invalid mode, no solver available')
            return
        }

        solver.setHooks({
            onStatusChange: async newStatus => {
                setStatus(newStatus)
            },
            onStepChange: async stepStates => {
                setStepStates(stepStates)
            },
            onError: async error => {
                console.error('Swap flow error:', error)
                await hooks.onFatalError(error)
                postMessage({ event: 'error', error }, '*')
            },
            onFinish: async () => {
                await hooks.onCompletion()
                postMessage({ event: 'finish' }, '*')
            }
        })

        const lock = createLock()

        const couldLock = await lock.couldLock()

        if (couldLock === true) {
            await solver.execute().finally(async () => {
                window.removeEventListener('beforeunload', beforeUnload)
                await lock.unlock()
            })
        } else {
            const secondsLeft = (couldLock.getTime() - Date.now()) / 1000
            const error = new Error(
                `Another swap is currently in progress. Please wait ${Math.ceil(secondsLeft)} seconds and try again.`
            )
            console.error('Swap flow error:', error)
            await hooks.onFatalError(error)
            postMessage({ event: 'error', error }, '*')
        }
    }

    return (
        <div
            className="multichain__wrapper"
            style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
        >
            <Button
                secondary
                theme={theme}
                onClick={onBack}
                disabled={status !== 'pending' && status !== 'failed'}
                testId="go-back"
            >
                Cancel
            </Button>
            <div className="multichain__row">
                <div className="multichain__column multichain__column--full">
                    <TextInput
                        theme={theme}
                        readOnly
                        value={shortenHash(swapData.sourceAddress)}
                        testId="readonly-source-address"
                    />
                </div>
                <Typography theme={theme} testId="symbol-right">
                    →
                </Typography>
                <div className="multichain__column multichain__column--full">
                    <TextInput
                        theme={theme}
                        readOnly
                        value={shortenHash(swapData.targetAddress)}
                        testId="readonly-target-address"
                    />
                </div>
            </div>
            {status !== 'pending' ? (
                <>
                    <Typography theme={theme} testId="duration-info" small secondary>
                        Please allow up to 5 minutes for the steps to complete.
                    </Typography>
                    {mode === 'funding' ? (
                        <FundingProgressTracker theme={theme} progress={stepStates} />
                    ) : mode === 'batch' ? (
                        <CreateBatchProgressTracker theme={theme} progress={stepStates} />
                    ) : null}
                </>
            ) : null}
            {status === 'pending' ? (
                <>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme} testId="source-chain-input__label">
                            Select the Source Chain
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
                        <AdvancedSelect
                            theme={theme}
                            onChange={e => {
                                setSourceChain(Number(e))
                                setSourceToken('0x0000000000000000000000000000000000000000')
                                setSelectedTokenBalance(null)
                                setSelectedTokenUsdPrice(null)
                            }}
                            onChangeGuard={async chainId => {
                                try {
                                    await switchChainAsync({ chainId: Number(chainId) })
                                    return true
                                } catch (error) {
                                    console.error(error)
                                    alert(
                                        'Failed to switch chain. Is the chain configured in your wallet? More details in console.'
                                    )
                                    return false
                                }
                            }}
                            value={sourceChain.toString()}
                            options={(chains || []).map(chain => ({
                                value: chain.id.toString(),
                                label: chain.displayName,
                                image: chain.iconUrl
                            }))}
                            testId="source-chain-input"
                        />
                    </LabelSpacing>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme} testId="source-token-input__label">
                            Select the Source Token
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
                        <AdvancedSelect
                            theme={theme}
                            onChange={e => {
                                setSelectedTokenBalance(null)
                                setSourceToken(e)
                            }}
                            value={sourceToken}
                            options={(tokenList || [])
                                .filter(x => x.address)
                                .map(x => ({
                                    value: x.address!,
                                    label: `${x.symbol} (${x.name})`,
                                    image: x.metadata?.logoURI
                                }))}
                            label={
                                selectedTokenBalance
                                    ? Numbers.toSignificantDigits(
                                          new FixedPointNumber(
                                              selectedTokenBalance.value,
                                              selectedTokenBalance.decimals
                                          ).toDecimalString(),
                                          3
                                      ) +
                                      ' ' +
                                      selectedTokenBalance.symbol
                                    : 'Loading...'
                            }
                            testId="source-token-input"
                        />
                    </LabelSpacing>
                    {selectedTokenAmountNeeded && selectedTokenUsdPrice ? (
                        <Typography theme={theme} small secondary testId="swap-summary">
                            You will swap {Numbers.toSignificantDigits(selectedTokenAmountNeeded.toDecimalString(), 3)}{' '}
                            {sourceTokenDisplayName} (~$
                            {(selectedTokenUsdPrice * selectedTokenAmountNeeded.toFloat()).toFixed(2)}) from{' '}
                            {sourceChainDisplayName} to fund:
                        </Typography>
                    ) : (
                        <Typography theme={theme} small secondary testId="swap-summary">
                            Swap details are loading...
                        </Typography>
                    )}
                    <div className="multichain__row">
                        <div className="multichain__column multichain__column--full">
                            <TokenDisplay
                                theme={theme}
                                leftLabel={`${neededDaiUsdValue.toFixed(2)} xDAI`}
                                rightLabel={`$${neededDaiUsdValue.toFixed(2)}`}
                                testId="xdai-display"
                            />
                        </div>
                        <div className="multichain__column multichain__column--full">
                            <TokenDisplay
                                theme={theme}
                                leftLabel={`${
                                    neededBzzAmount
                                        ? Numbers.toSignificantDigits(neededBzzAmount.toDecimalString(), 3)
                                        : 'Loading...'
                                } xBZZ`}
                                rightLabel={`$${(neededBzzUsdValue || 0).toFixed(2)}`}
                                testId="xbzz-display"
                            />
                        </div>
                    </div>
                </>
            ) : null}
            {status === 'pending' ? (
                <QuoteIndicator isLoading={loadingRelayQuote} theme={theme} quote={relayQuote} testId="quote-status" />
            ) : null}
            <Button
                theme={theme}
                onClick={onSwapWithErrorHandling}
                disabled={status !== 'pending' || !relayQuote || !hasSufficientBalance || !walletClient.data}
                testId="fund"
                tooltip={
                    !selectedTokenBalance && relayQuote
                        ? "Couldn't fetch and verify balance for the selected token. Only proceed if you are sure you have sufficient balance and know what you are doing. Make sure to check the transaction details in your wallet before confirming."
                        : undefined
                }
                icon={!selectedTokenBalance && relayQuote ? <AlertIcon /> : undefined}
            >
                {hasSufficientBalance ? 'Fund' : 'Insufficient balance'}
            </Button>
        </div>
    )
}
