import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
const USDT_NETWORK = 'ERC20 (Ethereum)'

// Cloudinary configuration (unsigned upload preset)
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
  const [depositHistory, setDepositHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const amounts = [20, 50, 100, 150, 200]

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setBalance(res.data.deposit_wallet_balance)
    }).catch(console.error)

    setLoadingHistory(true)
    api.get('/payments/history').then(res => {
      const deposits = res.data.filter((p: any) => p.type === 'deposit')
      setDepositHistory(deposits)
    }).catch(console.error).finally(() => setLoadingHistory(false))
  }, [])

  const finalAmount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0)

  const handleCopy = () => {
    navigator.clipboard.writeText(USDT_ADDRESS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleProceed = () => {
    if (finalAmount < 20) return
    setShowCryptoDetails(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      setError(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        setProofPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async () => {
    if (!proofFile) {
      setError('Please select an image')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedProofUrl(data.secure_url)
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitDeposit = async () => {
    if (!uploadedProofUrl) {
      setError('Please upload a payment proof')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await api.post('/payments/deposit', {
        amount: finalAmount,
        payment_method: 'USDT',
        network: 'ERC20',
        proof_url: uploadedProofUrl
      })

      // Show success state
      setSubmitSuccess(true)

      // Navigate to payments page after 3 seconds
      setTimeout(() => {
        navigate('/payments')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit deposit')
    } finally {
      setSubmitting(false)
    }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${USDT_ADDRESS}&bgcolor=ffffff&color=319795&margin=10`

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#e0f2f1', padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Recharge Account</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>🕒</button>
      </div>

      {/* Current Balance Card */}
      <div style={{
        backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>Current Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      {/* Select Amount Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Select Recharge Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => {
                setSelectedAmount(amt)
                setCustomAmount('')
              }}
              style={{
                height: '52px', borderRadius: '12px', border: (selectedAmount === amt && !customAmount) ? '2px solid #319795' : '1px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              ${amt}
              {selectedAmount === amt && !customAmount && (
                <div style={{
                  position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#4fd1c5',
                  borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  border: '2px solid white', fontWeight: 800
                }}>✓</div>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#111827', marginBottom: '8px', fontWeight: 600 }}>Or enter custom amount</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontWeight: 600 }}>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="Enter amount"
              style={{
                width: '100%', padding: '14px 40px 14px 32px', borderRadius: '12px',
                border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none',
                fontWeight: 500
              }}
            />
            {customAmount && (
              <button
                onClick={() => setCustomAmount('')}
                style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
              >✕</button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontWeight: 500 }}>Minimum deposit is $20</p>
        </div>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Choose Payment Method</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* ── Crypto USDT ERC20 ── */}
          <div
            onClick={() => { setMethod('crypto'); setShowCryptoDetails(false) }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', borderRadius: '16px',
              border: `2px solid ${method === 'crypto' ? '#319795' : 'transparent'}`,
              backgroundColor: 'white', cursor: 'pointer',
              boxShadow: method === 'crypto' ? '0 0 0 3px rgba(49,151,149,0.12)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', backgroundColor: '#319795', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', color: 'white', fontWeight: 800
              }}>₮</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Crypto (USDT - ERC20)</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Tether on Ethereum network</div>
              </div>
            </div>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              border: `2px solid ${method === 'crypto' ? '#319795' : '#d1d5db'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {method === 'crypto' && (
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />
              )}
            </div>
          </div>

          {/* ── M-Pesa — Coming Soon ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '16px', border: '2px solid transparent',
            backgroundColor: '#f9fafb', cursor: 'not-allowed', opacity: 0.65,
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 800, color: '#00AC4F'
              }}>M</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#6b7280' }}>M-PESA (Instant KES)</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Mobile money transfer</div>
              </div>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#f59e0b',
              backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '20px',
              border: '1px solid #fde68a', whiteSpace: 'nowrap'
            }}>Coming Soon</span>
          </div>

          {/* ── Wise — Coming Soon ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '16px', border: '2px solid transparent',
            backgroundColor: '#f9fafb', cursor: 'not-allowed', opacity: 0.65,
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: '#00B4D8', fontWeight: 800
              }}>W</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#6b7280' }}>Wise (International Transfer)</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Fast global payments</div>
              </div>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#f59e0b',
              backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '20px',
              border: '1px solid #fde68a', whiteSpace: 'nowrap'
            }}>Coming Soon</span>
          </div>

          {/* ── Bank Transfer — Coming Soon ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '16px', border: '2px solid transparent',
            backgroundColor: '#f9fafb', cursor: 'not-allowed', opacity: 0.65
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px'
              }}>🏦</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#6b7280' }}>Bank Transfer</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Wire / SWIFT transfer</div>
              </div>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#f59e0b',
              backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '20px',
              border: '1px solid #fde68a', whiteSpace: 'nowrap'
            }}>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div style={{ marginBottom: '24px', padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Method:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>Crypto (USDT-ERC20)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Exchange Rate:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>1 USDT = 1 USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Total to pay:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>{finalAmount.toFixed(2)} USDT</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Fees:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>None</span>
        </div>
      </div>

      {/* Success Confirmation Screen */}
      {submitSuccess && (
        <div style={{
          backgroundColor: 'white', borderRadius: '20px', padding: '40px 24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '24px',
          border: '1px solid #e5e7eb', textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#d1fae5', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '40px'
          }}>✓</div>

          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Deposit Submitted!</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.6' }}>
            Your deposit of <strong>${finalAmount.toFixed(2)} USDT</strong> has been submitted successfully.
          </p>

          <div style={{
            backgroundColor: '#f0fdf4', border: '1px solid #dcfce7',
            borderRadius: '12px', padding: '16px', marginBottom: '24px'
          }}>
            <p style={{ fontSize: '13px', color: '#15803d', margin: 0, fontWeight: 600 }}>
              ⏳ Your deposit is pending admin approval. You will receive a notification once it is confirmed.
            </p>
          </div>

          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>
            Redirecting to payments dashboard in a few seconds...
          </p>

          <button
            onClick={() => navigate('/payments')}
            style={{
              width: '100%', padding: '14px', borderRadius: '20px',
              backgroundColor: '#319795', border: 'none',
              color: 'white', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(49,151,149,0.3)'
            }}
          >
            Go to Payments Now
          </button>
        </div>
      )}

      {/* Proceed Button */}
      {!showCryptoDetails && !submitSuccess && (
        <button
          onClick={handleProceed}
          disabled={finalAmount < 20}
          style={{
            width: '100%', padding: '16px', borderRadius: '20px',
            backgroundColor: finalAmount < 20 ? '#a0aec0' : '#319795',
            border: 'none', color: 'white', fontSize: '16px', fontWeight: 700,
            cursor: finalAmount < 20 ? 'not-allowed' : 'pointer',
            boxShadow: finalAmount < 20 ? 'none' : '0 4px 12px rgba(49,151,149,0.3)',
            marginBottom: '12px'
          }}
        >
          Proceed to Pay
        </button>
      )}

      {/* Crypto Details Panel */}
      {showCryptoDetails && (
        <div style={{
          backgroundColor: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '24px',
          border: '1px solid #e5e7eb', animation: 'slideIn 0.3s ease-out'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', margin: 0 }}>Payment Details</h2>

          {/* QR Code Section */}
          <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: '0 0 12px' }}>SCAN TO PAY</p>
            <img src={qrUrl} alt="USDT Address QR Code" style={{ width: '140px', height: '140px', borderRadius: '12px' }} />
          </div>

          {/* Wallet Address Section */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: '0 0 8px' }}>WALLET ADDRESS</p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <code style={{
                flex: 1, fontSize: '13px', fontFamily: 'monospace', color: '#111827',
                wordBreak: 'break-all', fontWeight: 600
              }}>{USDT_ADDRESS}</code>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: 'none',
                  backgroundColor: copied ? '#d1fae5' : '#e5e7eb',
                  color: copied ? '#065f46' : '#374151',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Network Warning */}
          <div style={{
            backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
            padding: '12px', marginBottom: '20px', display: 'flex', gap: '8px'
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>Use {USDT_NETWORK} Only</p>
              <p style={{ fontSize: '11px', color: '#b45309', margin: 0 }}>Sending from other networks will result in loss of funds.</p>
            </div>
          </div>

          {/* Steps */}
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>STEPS TO COMPLETE PAYMENT:</p>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.8' }}>
              <li>Open your wallet (MetaMask, Trust Wallet, etc.)</li>
              <li>Send exactly <strong>{finalAmount.toFixed(2)} USDT</strong> to the address above</li>
              <li>Take a screenshot of the transaction confirmation</li>
              <li>Upload the screenshot below</li>
            </ol>
          </div>

          {/* File Upload Section */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: '0 0 12px' }}>UPLOAD PAYMENT PROOF</p>

            {/* File Input */}
            {!uploadedProofUrl && (
              <label style={{
                display: 'block', padding: '24px', borderRadius: '12px',
                border: '2px dashed #d1d5db', backgroundColor: '#f9fafb',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>PNG, JPG, GIF up to 5MB</p>
              </label>
            )}

            {/* Preview */}
            {proofPreview && !uploadedProofUrl && (
              <div style={{
                marginTop: '12px', borderRadius: '12px', overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <img src={proofPreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
              </div>
            )}

            {/* Upload Button */}
            {proofPreview && !uploadedProofUrl && (
              <button
                onClick={handleUploadProof}
                disabled={uploading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  backgroundColor: uploading ? '#a0aec0' : '#319795',
                  color: 'white', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 700, marginTop: '12px'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload Proof'}
              </button>
            )}

            {/* Success State */}
            {uploadedProofUrl && (
              <div style={{
                backgroundColor: '#ecfdf5', border: '1px solid #d1fae5',
                borderRadius: '8px', padding: '12px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Proof uploaded successfully</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '12px', marginBottom: '12px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>❌ {error}</span>
              </div>
            )}
          </div>

          {/* Done / Back buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowCryptoDetails(false)}
              style={{
                flex: 1, padding: '14px', borderRadius: '20px',
                backgroundColor: 'white', border: '2px solid #319795',
                color: '#319795', fontSize: '15px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSubmitDeposit}
              disabled={!uploadedProofUrl || submitting}
              style={{
                flex: 2, padding: '14px', borderRadius: '20px',
                backgroundColor: !uploadedProofUrl || submitting ? '#a0aec0' : '#319795',
                border: 'none',
                color: 'white', fontSize: '15px', fontWeight: 700,
                cursor: !uploadedProofUrl || submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(49,151,149,0.3)'
              }}
            >
              {submitting ? '⏳ Submitting...' : 'Submit Deposit ✓'}
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
        * Funds will be credited after admin approval and payment confirmation.
      </p>

      {/* Deposit History Section */}
      {!showCryptoDetails && !submitSuccess && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Your Deposit History</h3>
          
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#319795', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#6B7280', fontSize: '13px' }}>Loading history...</p>
            </div>
          ) : depositHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: 'white' }}>
              {/* Header Row */}
              <div style={{
                backgroundColor: '#f9fafb', padding: '12px 16px',
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px',
                borderBottom: '1px solid #E5E7EB'
              }}>
                <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Amount</p>
                <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Date</p>
                <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Method</p>
                <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Status</p>
              </div>

              {/* Data Rows */}
              {depositHistory.slice(0, 5).map((payment, index) => {
                const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
                  pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
                  paid: { bg: '#ecfdf5', text: '#065f46', icon: '✓' },
                  rejected: { bg: '#fef2f2', text: '#991b1b', icon: '✕' },
                  cancelled: { bg: '#f3f4f6', text: '#374151', icon: '−' },
                }
                const statusColor = statusColors[payment.status] || statusColors.pending
                
                const formattedDate = payment.created_at
                  ? new Date(payment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : payment.period
                
                return (
                  <div
                    key={payment.id}
                    style={{
                      padding: '14px 16px',
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px',
                      alignItems: 'center', borderBottom: index < depositHistory.length - 1 ? '1px solid #E5E7EB' : 'none'
                    }}
                  >
                    {/* Amount */}
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>${payment.amount.toFixed(2)}</p>

                    {/* Date */}
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{formattedDate}</p>

                    {/* Method */}
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{payment.payment_method || 'N/A'}</p>

                    {/* Status */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: statusColor.bg, color: statusColor.text,
                      padding: '4px 10px', borderRadius: '16px',
                      fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                      width: 'fit-content'
                    }}>
                      <span>{statusColor.icon}</span>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px',
              textAlign: 'center', border: '1px solid #E5E7EB'
            }}>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>No deposit history yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
