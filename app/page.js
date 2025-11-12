// same logic as previous fixed version (not rewritten here for brevity)
'use client'
import Providers from './providers'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useEffect, useState } from 'react'

const SZPN = process.env.NEXT_PUBLIC_SZPN_CONTRACT || '0x83e137Cf30dC28E5e6D28a63E841aA3Bc6AF1A99'
const ERC20 = [
  { type:'function', name:'decimals', stateMutability:'view', inputs:[], outputs:[{type:'uint8'}] },
  { type:'function', name:'symbol', stateMutability:'view', inputs:[], outputs:[{type:'string'}] },
  { type:'function', name:'balanceOf', stateMutability:'view', inputs:[{name:'a', type:'address'}], outputs:[{type:'uint256'}] },
  { type:'function', name:'transfer', stateMutability:'nonpayable', inputs:[{name:'to', type:'address'},{name:'amount', type:'uint256'}], outputs:[{type:'bool'}] },
]

function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [decimals, setDecimals] = useState(18)
  const [symbol, setSymbol] = useState('SZPN')
  const [balance, setBalance] = useState('0')
  const [txs, setTxs] = useState([])

  const { data: decData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'decimals' })
  const { data: symData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'symbol' })
  const { data: balData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'balanceOf', args: address ? [address] : undefined })

  useEffect(() => { if (decData) setDecimals(Number(decData)) }, [decData])
  useEffect(() => { if (symData) setSymbol(symData) }, [symData])
  useEffect(() => { if (balData != null) setBalance(formatUnits(balData, decimals)) }, [balData, decimals])

  useEffect(() => {
    async function run() {
      if (!address) return setTxs([])
      const key = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || ''
      const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${SZPN}&address=${address}&page=1&offset=10&sort=desc${key ? `&apikey=${key}`:''}`
      const r = await fetch(url)
      const j = await r.json()
      setTxs(Array.isArray(j.result) ? j.result : [])
    }
    run()
  }, [address])

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  function onSend(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const to = fd.get('to')
    const amountStr = fd.get('amount')
    if (!to || !amountStr) return
    const value = parseUnits(amountStr, decimals)
    writeContract({ address: SZPN, abi: ERC20, functionName: 'transfer', args: [to, value] })
  }

  return (
    <div className="container" style={{padding:20,maxWidth:700,margin:'auto'}}>
      <h1>SZPN Dashboard (BSC)</h1>
      {!isConnected ? (
        <button onClick={() => connect()} className="btn">지갑 연결</button>
      ) : (
        <button onClick={() => disconnect()} className="btn">연결 해제</button>
      )}
      <p>주소: {address}</p>
      <p>잔액: {balance} {symbol}</p>
      <form onSubmit={onSend}>
        <input name="to" placeholder="받는 주소 (0x...)" className="input" required />
        <input name="amount" placeholder="보낼 수량 (예: 10)" className="input" required />
        <button type="submit" className="btn">전송하기</button>
      </form>
      {isPending && <p>전송 중...</p>}
      {isSuccess && <p>✅ 전송 성공</p>}
      {error && <p>오류: {error.message}</p>}
      <h3>최근 트랜잭션</h3>
      <ul>
        {txs.map(t => (
          <li key={t.hash}>
            <a href={`https://bscscan.com/tx/${t.hash}`} target="_blank">{t.hash.slice(0,10)}...</a> — {formatUnits(BigInt(t.value), 18)} {symbol}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Page() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  )
}
