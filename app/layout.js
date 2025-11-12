import '../styles/globals.css'

export const metadata = {
  title: 'SZPN Dashboard (BSC)',
  description: 'SZPN Dashboard unified version supporting TokenPocket & MetaMask',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
