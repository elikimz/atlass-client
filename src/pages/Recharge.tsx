import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
// const USDT_NETWORK = 'ERC20 (Ethereum)'
const CLOUDINARY_UPLOAD_PRESET = "task_images"
const CLOUDINARY_CLOUD_NAME = "doste1wr0"

export default function Recharge() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('crypto')
  const [copied, setCopied] = useState(false)
  const [showCryptoDetails, setShowCryptoDetails] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    api.get('/auth/me').then(res => setBalance(res.data.deposit_wallet_balance)).catch(console.error)
  }, [])

  const amounts = [20, 50, 100, 150, 200]
  const finalAmount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0)
  const handleCopy = () => { navigator.clipboard.writeText(USDT_ADDRESS).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) }) }
  const handleProceed = () => { if (finalAmount < 20) return; setShowCryptoDetails(true) }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setProofFile(file); setError(null); const reader = new FileReader(); reader.onload = (event) => setProofPreview(event.target?.result as string); reader.readAsDataURL(file) }
  }

  const handleUploadProof = async () => {
    if (!proofFile) { setError('Please select an image'); return }
    setUploading(true); setError(null)
    try {
      const formData = new FormData(); formData.append('file', proofFile); formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json(); setUploadedProofUrl(data.secure_url)
    } catch (err: any) { setError(err.message || 'Failed to upload proof') } finally { setUploading(false) }
  }

  const handleSubmitDeposit = async () => {
    if (!uploadedProofUrl) { setError('Please upload a payment proof'); return }
    setSubmitting(true); setError(null)
    try {
      await api.post('/payments/deposit', { amount: finalAmount, payment_method: 'USDT', network: 'ERC20', proof_url: uploadedProofUrl })
      setSubmitSuccess(true); setTimeout(() => navigate('/payments'), 3000)
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to submit deposit') } finally { setSubmitting(false) }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${USDT_ADDRESS}&bgcolor=ffffff&color=319795&margin=10`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Recharge Account</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>🕒</button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '24px', textAlign: 'center', boxShadow: 'var(--card-shadow)', marginBottom: '24px', border: '1px solid var(--border-main)' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Current Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-heading)' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Select Recharge Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {amounts.map(amt => (
            <button key={amt} onClick={() => { setSelectedAmount(amt); setCustomAmount('') }} style={{ height: '52px', borderRadius: '12px', border: (selectedAmount === amt && !customAmount) ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, cursor: 'pointer', position: 'relative' }}>
              ${amt}
              {selectedAmount === amt && !customAmount && <div style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white', fontWeight: 800 }}>✓</div>}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-heading)', marginBottom: '8px', fontWeight: 600 }}>Or enter custom amount</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
            <input type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }} placeholder="Enter amount" style={{ width: '100%', padding: '14px 40px 14px 32px', borderRadius: '12px', border: '1px solid var(--border-main)', fontSize: '16px', outline: 'none', fontWeight: 500, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>Minimum deposit is $20</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Choose Payment Method</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div onClick={() => { setMethod('crypto'); setShowCryptoDetails(false) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', border: `2px solid ${method === 'crypto' ? 'var(--accent-primary)' : 'transparent'}`, backgroundColor: 'var(--bg-card)', cursor: 'pointer', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white', fontWeight: 800 }}>₮</div>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>Crypto (USDT - ERC20)</div><div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Tether on Ethereum network</div></div>
            </div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${method === 'crypto' ? 'var(--accent-primary)' : 'var(--border-main)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{method === 'crypto' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />}</div>
          </div>
        </div>
      </div>

      {!showCryptoDetails ? (
        <button onClick={handleProceed} disabled={finalAmount < 20} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: finalAmount < 20 ? 0.6 : 1 }}>Recharge Now</button>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border-main)', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '16px', textAlign: 'center' }}>USDT Payment Details</h4>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '12px', backgroundColor: 'white', borderRadius: '16px' }}><img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px' }} /></div>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>USDT ERC20 ADDRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}><code style={{ fontSize: '13px', color: 'var(--text-main)', wordBreak: 'break-all', fontWeight: 700 }}>{USDT_ADDRESS}</code><button onClick={handleCopy} style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{copied ? 'COPIED!' : 'COPY'}</button></div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>Upload Payment Proof</h5>
            <div style={{ border: '2px dashed var(--border-main)', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => document.getElementById('proof-upload')?.click()}>
              {proofPreview ? <img src={proofPreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} /> : <div style={{ padding: '20px' }}><div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Click to upload screenshot</p></div>}
              <input type="file" id="proof-upload" hidden accept="image/*" onChange={handleFileSelect} />
            </div>
            {proofFile && !uploadedProofUrl && <button onClick={handleUploadProof} disabled={uploading} style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-main)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Confirm Upload'}</button>}
            {uploadedProofUrl && <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#166534', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>✅ Proof uploaded successfully</div>}
          </div>
          <button onClick={handleSubmitDeposit} disabled={submitting || !uploadedProofUrl} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', opacity: (submitting || !uploadedProofUrl) ? 0.6 : 1 }}>{submitting ? 'Submitting...' : 'Submit Deposit'}</button>
          {submitSuccess && <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#166534', borderRadius: '12px', textAlign: 'center', fontWeight: 700 }}>Deposit submitted! Redirecting...</div>}
          {error && <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{error}</div>}
        </div>
      )}
    </div>
  )
}
