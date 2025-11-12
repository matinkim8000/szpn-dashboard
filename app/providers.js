'use client'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// TokenPocket 확장 인식 코드 추가
if (typeof window !== 'undefined' && window.tokenpocket) {
  window.ethereum = window.tokenpocket; // TokenPocket provider 주입
}

const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org'),
  },
  connectors: [injected()],
})

const queryClient = new QueryClient()

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
