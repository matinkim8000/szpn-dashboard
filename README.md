# SZPN Dashboard (BSC) — One‑Click Deploy

A minimal Next.js app that shows your SZPN token balance, recent SZPN transfers, and lets you send SZPN directly from your browser (MetaMask/WalletConnect via injected connector).

## Features
- Connect wallet (MetaMask)
- Read SZPN balance
- Send SZPN (`transfer(to, amount)`)
- Recent SZPN transfers for your address (BscScan API)
- Deployed easily on Vercel

## Quick Start (Local)
```bash
cp .env.example .env.local
npm install
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel
1. Create a new GitHub repo and push these files.
2. On Vercel, "New Project" → Import your repo → Deploy.
3. Add your env vars at Vercel Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_BSC_RPC_URL`
   - `NEXT_PUBLIC_SZPN_CONTRACT`
   - (optional) `NEXT_PUBLIC_BSCSCAN_API_KEY`
4. Redeploy.

## Notes
- Gas is paid in BNB on BSC.
- Ensure your wallet is on **BNB Smart Chain**.
- For production, use a reliable RPC endpoint and set a BscScan API key to avoid rate limits.
