import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { chain } from '@/utils/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { LedgerConnector } from 'wagmi/connectors/ledger'

const ACLHEMY_API_KEY = process.env.ACLHEMY_API_KEY || ""

const providers = []

if (ACLHEMY_API_KEY != "") {
    providers.push(alchemyProvider({ apiKey: ACLHEMY_API_KEY }))
}
providers.push(publicProvider())

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [chain],
    providers,
)

const config = createConfig({
    autoConnect: false,
    connectors: [
        new InjectedConnector({
            chains,
            options: {
                name: 'Injected',
                shimDisconnect: true,
            },
        }),
        new LedgerConnector({
            chains,
            options: {
                projectId: "a80bc1990b7064fb02f3f1c48809c4e8"
            }
        }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: 'wagmi',
            },
        }),
        new WalletConnectConnector({
            chains,
            options: {
                projectId: 'a80bc1990b7064fb02f3f1c48809c4e8',
            },
        }),
        new MetaMaskConnector({ chains }),
    ],
    publicClient,
    webSocketPublicClient,
})

export default config;