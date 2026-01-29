import { Intent } from '../Intent'
import { MultichainTheme } from '../MultichainTheme'
import { Typography } from '../primitives/Typography'

interface Props {
    theme: MultichainTheme
    intent: Intent
}

const copies: Record<Intent, string> = {
    'initial-funding':
        "Your Bee node needs an initial funding on the Gnosis chain to start. You'll receive xDAI for transaction gas fees and xBZZ tokens for the storage and bandwidth costs.",
    'postage-batch':
        'To upload data to Swarm, the network requires a postage batch - analogous to renting storage. Using this widget will help you swap funds for xBZZ tokens and then proceed to create one.',
    arbitrary: 'Configure the amounts of xDAI and xBZZ tokens to suit your specific needs.'
}

export function IntentInfo({ theme, intent }: Props) {
    return (
        <div className="multichain__row">
            <svg width="80" height="80" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <circle cx="256" cy="256" r="200" fill="#0074D9" stroke="#0074D9" strokeWidth="20" />
                <circle cx="256" cy="160" r="20" fill="white" stroke="white" strokeWidth="20" />
                <path
                    d="M 221 226 l 30 0 l 0 30 l -30 0 z"
                    stroke="white"
                    strokeWidth="20"
                    fill="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 241 226 l 30 0 l 0 130 l -30 0 z"
                    stroke="white"
                    strokeWidth="20"
                    fill="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 271 326 l 30 0 l 0 30 l -30 0 z"
                    stroke="white"
                    strokeWidth="20"
                    fill="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <Typography theme={theme}>{copies[intent]}</Typography>
        </div>
    )
}
