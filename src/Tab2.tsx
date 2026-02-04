import { useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { Execute, getClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Arrays, Cache, Dates, FixedPointNumber, Numbers, Objects, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useChains, useSendTransaction, useSwitchChain, useWalletClient } from 'wagmi'
import { getBalance } from 'wagmi/actions'
import { ProgressTracker } from './components/ProgressTracker'
import { QuoteIndicator } from './components/QuoteIndicator'
import { TokenDisplay } from './components/TokenDisplay'
import { config } from './Config'
import { createFlow } from './Flow'
import { MultichainHooks } from './MultichainHooks'
import { MultichainTheme } from './MultichainTheme'
import { AdvancedSelect } from './primitives/AdvancedSelect'
import { Button } from './primitives/Button'
import { LabelSpacing } from './primitives/LabelSpacing'
import { Span } from './primitives/Span'
import { TextInput } from './primitives/TextInput'
import { Typography } from './primitives/Typography'
import { SwapData } from './SwapData'
import { shortenHash } from './Utility'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    initialChainId: number
    library: MultichainLibrary
}

interface Balance {
    symbol: string
    decimals: number
    value: bigint
}

export function Tab2({ theme, hooks, setTab, swapData, initialChainId, library }: Props) {
    // states for user input
    const [sourceChain, setSourceChain] = useState<number>(initialChainId)
    const [sourceToken, setSourceToken] = useState<string>(library.constants.nullAddress)

    // states for network data
    const [bzzUsdPrice, setBzzUsdPrice] = useState<number | null>(null)
    const [selectedTokenBalance, setSelectedTokenBalance] = useState<Balance | null>(null)
    const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<number | null>(null)
    const [selectedTokenAmountNeeded, setSelectedTokenAmountNeeded] = useState<FixedPointNumber | null>(null)

    // quote state
    const [loadingRelayQuote, setLoadingRelayQuote] = useState<boolean>(true)
    const [relayQuote, setRelayQuote] = useState<Execute | null>(null)

    // states for flow status
    const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'failed'>('pending')
    const [stepStates, setStepStates] = useState<
        Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>
    >({})

    // relay and wagmi hooks
    const relayClient = getClient()
    const walletClient = useWalletClient()
    const { chains: relayChains } = useRelayChains()
    const configuredChains = useChains()
    const chains =
        relayChains && configuredChains ? relayChains.filter(x => configuredChains.some(y => x.id === y.id)) : []
    const { data: tokenList } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })
    const { switchChainAsync } = useSwitchChain()

    // computed
    const sourceChainDisplayName = chains.find(x => x.id === sourceChain)?.displayName || 'N/A'
    const sourceTokenObject = (tokenList || []).find(x => x.address === sourceToken)
    const sourceTokenDisplayName = sourceTokenObject ? sourceTokenObject.symbol : 'N/A'
    const neededBzzAmount = FixedPointNumber.fromDecimalString(swapData.bzzAmount.toString(), 16)
    let neededBzzUsdValue: number | null = null
    const neededDaiUsdValue = swapData.nativeAmount + parseFloat(library.constants.daiDustAmount.toDecimalString())
    let totalNeededUsdValue: number | null = null
    if (bzzUsdPrice && selectedTokenUsdPrice && sourceTokenObject?.decimals) {
        neededBzzUsdValue = parseFloat(neededBzzAmount.toDecimalString()) * bzzUsdPrice
        totalNeededUsdValue = (neededBzzUsdValue + neededDaiUsdValue) * 1.1 // +10% slippage
    }
    const hasSufficientBalance = selectedTokenBalance
        ? selectedTokenAmountNeeded &&
          selectedTokenBalance &&
          selectedTokenAmountNeeded.value <= selectedTokenBalance.value
        : true

    // send transaction hook in case of xdai source token
    const { sendTransactionAsync } = useSendTransaction()

    // watch bzz price
    useEffect(() => {
        return System.runAndSetInterval(() => {
            library
                .getGnosisBzzTokenPrice()
                .then(price => setBzzUsdPrice(price))
                .catch(error => {
                    console.error('Error fetching BZZ price:', error)
                })
        }, Dates.minutes(1))
    }, [])

    useEffect(() => {
        if (!tokenList) {
            return
        }
        const sourceTokenObject: { decimals?: number } | undefined = tokenList.find(x => x.address === sourceToken)
        if (!sourceTokenObject) {
            return
        }
        if (bzzUsdPrice && selectedTokenUsdPrice && sourceTokenObject.decimals) {
            const neededDaiUsdValue =
                swapData.nativeAmount + parseFloat(library.constants.daiDustAmount.toDecimalString())
            const neededBzzUsdValue = parseFloat(neededBzzAmount.toDecimalString()) * bzzUsdPrice
            const totalNeededUsdValue = (neededBzzUsdValue + neededDaiUsdValue) * 1.1
            setSelectedTokenAmountNeeded(
                FixedPointNumber.fromDecimalString(
                    (totalNeededUsdValue / selectedTokenUsdPrice).toString(),
                    sourceTokenObject.decimals
                )
            )
        }
    }, [bzzUsdPrice, selectedTokenUsdPrice, tokenList, sourceToken])

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
                    const balance = await getBalance(config, {
                        address: swapData.sourceAddress as `0x${string}`,
                        token:
                            sourceToken === library.constants.nullAddress ? undefined : (sourceToken as `0x${string}`),
                        chainId: sourceChain
                    })
                    setSelectedTokenBalance(balance)
                } catch (error) {
                    console.error('Error fetching selected token balance:', error)
                }
            }, Dates.minutes(1)),
            System.runAndSetInterval(async () => {
                if (!selectedTokenAmountNeeded) {
                    setRelayQuote(null)
                    setLoadingRelayQuote(true)
                    return
                } else {
                    const quoteConfiguration = {
                        user: swapData.sourceAddress,
                        recipient: swapData.temporaryAddress,
                        chainId: sourceChain,
                        toChainId: library.constants.gnosisChainId,
                        currency: sourceToken,
                        toCurrency: library.constants.nullAddress, // xDAI
                        tradeType: 'EXACT_INPUT' as const,
                        amount: selectedTokenAmountNeeded.toString()
                    }
                    const quote = await Cache.get(JSON.stringify(quoteConfiguration), Dates.seconds(30), async () => {
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
                }
            }, Dates.seconds(2))
        ])
    }, [sourceChain, sourceToken, setRelayQuote, setLoadingRelayQuote, selectedTokenAmountNeeded])

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

        const solver = createFlow({
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
            relayClient,
            walletClient: walletClient.data
        })

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
            },
            onFinish: async () => {
                await hooks.onCompletion()
            }
        })

        await solver.execute()
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
                    <ProgressTracker theme={theme} progress={stepStates} />
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
                                setSelectedTokenAmountNeeded(null)
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
                                setSelectedTokenUsdPrice(null)
                                setSelectedTokenAmountNeeded(null)
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
                    <Typography theme={theme} small secondary testId="swap-summary">
                        You will swap{' '}
                        {Numbers.toSignificantDigits(selectedTokenAmountNeeded?.toDecimalString() || '0', 3)} (~$
                        {Numbers.toSignificantDigits(totalNeededUsdValue?.toString() || '0', 2)}){' '}
                        {sourceTokenDisplayName} from {sourceChainDisplayName} to fund:
                    </Typography>
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
            >
                {hasSufficientBalance ? 'Fund' : 'Insufficient balance'}
            </Button>
        </div>
    )
}
