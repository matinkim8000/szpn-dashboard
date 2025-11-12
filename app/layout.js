import '../styles/globals.css'

export const metadata = {
  title: 'SZPN Dashboard (BSC)',
  description: 'SZPN balance, recent transfers, and send function on BNB Smart Chain',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
