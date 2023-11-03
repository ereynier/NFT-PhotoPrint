import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { chain } from '@/utils/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

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
    publicClient,
    webSocketPublicClient,
  })

export default config;