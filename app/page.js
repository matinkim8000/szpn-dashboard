'use client'
import Providers from './providers'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useEffect, useMemo, useState } from 'react'

const SZPN = process.env.NEXT_PUBLIC_SZPN_CONTRACT || '0x83e137Cf30dC28E5e6D28a63E841aA3Bc6AF1A99'

const ERC20 = [
  { type:'function', name:'decimals', stateMutability:'view', inputs:[], outputs:[{type:'uint8'}] },
  { type:'function', name:'symbol', stateMutability:'view', inputs:[], outputs:[{type:'string'}] },
  { type:'function', name:'balanceOf', stateMutability:'view', inputs:[{name:'a', type:'address'}], outputs:[{type:'uint256'}] },
  { type:'function', name:'transfer', stateMutability:'nonpayable', inputs:[{name:'to', type:'address'}, {name:'amount', type:'uint256'}], outputs:[{type:'bool'}] },
]

function UI() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [decimals, setDecimals] = useState(18)
  const [symbol, setSymbol] = useState('SZPN')
  const [balance, setBalance] = useState('0')
  const [txs, setTxs] = useState([])

  // Reads
  const { data: decData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'decimals' })
  const { data: symData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'symbol' })
  const { data: balData } = useReadContract({ address: SZPN, abi: ERC20, functionName: 'balanceOf', args: address ? [address] : undefined })

  useEffect(() => { if (decData) setDecimals(Number(decData)) }, [decData])
  useEffect(() => { if (symData) setSymbol(symData) }, [symData])
  useEffect(() => { if (balData != null) setBalance(formatUnits(balData, decimals)) }, [balData, decimals])

  // Recent token txs via BscScan
  useEffect(() => {
    async function run() {
      if (!address) return setTxs([])
      const key = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || ''
      const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${SZPN}&address=${address}&page=1&offset=10&sort=desc${key ? `&apikey=${key}`:''}`
      try {
        const r = await fetch(url)
        const j = await r.json()
        setTxs(Array.isArray(j.result) ? j.result : [])
      } catch (e) { setTxs([]) }
    }
    run()
  }, [address])

  // Send
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  function onSend(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const to = String(fd.get('to')||'').trim()
    const amountStr = String(fd.get('amount')||'').trim()
    if (!to || !amountStr) return
    const value = parseUnits(amountStr, decimals)
    writeContract({ address: SZPN, abi: ERC20, functionName: 'transfer', args: [to, value] })
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div><div className="h1">SZPN Dashboard (BSC)</div><div className="small">지갑 연결 → 잔액/거래 확인 → 바로 전송</div></div>
          {!isConnected ? (
            <button className="btn primary" onClick={() => connect()}>지갑 연결</button>
          ) : (
            <button className="btn" onClick={() => disconnect()}>연결 해제</button>
          )}
        </div>
        <div className="hr" />
        <div className="kv">
          <div>지갑 주소</div><div>{address || '-'}</div>
          <div>토큰</div><div>{symbol} (decimals {decimals})</div>
          <div>잔액</div><div>{balance} {symbol}</div>
        </div>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h2">SZPN 전송</div>
        <form onSubmit={onSend} className="row">
          <input className="input" name="to" placeholder="받는 주소 0x..." required />
          <input className="input" name="amount" placeholder="보낼 수량 (예: 12.34)" required />
          <button className="btn primary" type="submit" disabled={isPending}>{isPending ? '전송 중…' : '전송하기'}</button>
        </form>
        {hash && <div className="small" style={{marginTop:8}}>Tx: <a target="_blank" href={`https://bscscan.com/tx/${hash}`}>{hash}</a></div>}
        {isSuccess && <div className="small" style={{color:'#66d19e',marginTop:6}}>✅ 전송 성공</div>}
        {error && <div className="small" style={{color:'#ff8a8a',marginTop:6}}>오류: {String(error.message||error)}</div>}
        <div className="small" style={{marginTop:8}}>※ 가스는 BNB로 지불됩니다. 지갑 네트워크가 BSC인지 확인하세요.</div>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h2">최근 나의 SZPN 트랜잭션</div>
        <table className="table">
          <thead><tr><th>해시</th><th>From → To</th><th>수량</th><th>시간</th></tr></thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.hash}>
                <td><a target="_blank" href={`https://bscscan.com/tx/${t.hash}`}>{t.hash.slice(0,10)}…</a></td>
                <td>{t.from.slice(0,8)}… → {t.to.slice(0,8)}…</td>
                <td>{formatUnits(BigInt(t.value), 18)} {symbol}</td>
                <td>{t.timeStamp ? new Date(Number(t.timeStamp)*1000).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {txs.length===0 && <tr><td colSpan={4} className="small">표시할 기록이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Providers>
      <UI />
    </Providers>
  )
}
