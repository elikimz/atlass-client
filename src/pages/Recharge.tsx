import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
// const USDT_NETWORK = 'ERC20 (Ethereum)'
const CLOUDINARY_UPLOAD_PRESET = "task_images"
const CLOUDINARY_CLOUD_NAME = "doste1wr0"

export default function Recharge() {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState('')

  const handleAmountSelect = (amt: number) => { setSelectedAmount(amt); setCustomAmount('') }
  const finalAmount = selectedAmount || Number(customAmount) || 0

  const handleProceed = () => { if (finalAmount >= 20) setStep(2) }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json(); setUploadedProofUrl(data.secure_url)
    } catch (err) { alert('Upload failed') }
  }

  const handleSubmitDeposit = async () => {
    try {
      setSubmitting(true)
      await api.post('/payments/deposit', { amount: finalAmount, proof_url: uploadedProofUrl, payment_method: 'USDT', network: 'ERC20' })
      alert('Deposit submitted! Admin will review it shortly.'); navigate('/dashboard')
    } catch (err) { alert('Failed to submit deposit') } finally { setSubmitting(false) }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Recharge Wallet</h1><p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Add funds to your account via USDT</p></div>
      {step === 1 ? (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[50, 100, 200, 500].map(amt => (
              <button key={amt} onClick={() => handleAmountSelect(amt)} style={{ padding: '16px', borderRadius: '16px', border: selectedAmount === amt ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)', backgroundColor: selectedAmount === amt ? 'var(--accent-light)' : 'var(--bg-main)', color: 'var(--text-heading)', fontSize: '18px', fontWeight: 700, cursor: 'pointer', position: 'relative' }}>
                ${amt}{selectedAmount === amt && <div style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Custom Amount (Min $20)</label><input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }} placeholder="Enter amount" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }} /></div>
          <button onClick={handleProceed} disabled={finalAmount < 20} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: finalAmount < 20 ? 0.6 : 1 }}>Next Step</button>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}><div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Send exactly</div><div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)' }}>${finalAmount} USDT</div></div>
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-main)', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>USDT Address (ERC20)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700, wordBreak: 'break-all', marginBottom: '12px' }}>{USDT_ADDRESS}</div>
            <button onClick={() => navigator.clipboard.writeText(USDT_ADDRESS)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Copy Address</button>
          </div>
          <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>Upload Payment Proof (Screenshot)</label><input type="file" onChange={handleFileUpload} accept="image/*" style={{ width: '100%', fontSize: '14px', color: 'var(--text-muted)' }} /></div>
          <button onClick={handleSubmitDeposit} disabled={submitting || !uploadedProofUrl} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: (submitting || !uploadedProofUrl) ? 0.6 : 1 }}>{submitting ? 'Submitting...' : 'Submit Deposit'}</button>
          <button onClick={() => setStep(1)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', cursor: 'pointer' }}>Go Back</button>
        </div>
      )}
    </div>
  )
}
