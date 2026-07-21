import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
const USDT_NETWORK = 'ERC20 (Ethereum)'

// Cloudinary configuration (unsigned upload preset)
const CLOUDINARY_UPLOAD_PRESET = "task_images"
const CLOUDINARY_CLOUD_NAME = "doste1wr0"

export default function Recharge() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<{ deposit_wallet_balance?: number }>('/auth/me')).data,
    staleTime: 5 * 60 * 1000,
  })
  const paymentHistoryQuery = useQuery({
    queryKey: queryKeys.payments.history(1, 50),
    queryFn: async () => (await api.get<any[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const balance = userQuery.data?.deposit_wallet_balance ?? 0
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState<'crypto' | 'mpesa'>('crypto')
  const [copied, setCopied] = useState(false)
  const [showCryptoDetails, setShowCryptoDetails] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const amounts = [20, 50, 100, 150, 200]
  const depositHistory = (paymentHistoryQuery.data ?? []).filter((payment: any) => payment.type === 'deposit')
  const loadingHistory = paymentHistoryQuery.isLoading

  const finalAmount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0)

  const handleCopy = () => {
    navigator.clipboard.writeText(USDT_ADDRESS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleProceed = () => {
    if (finalAmount < 20) return

    if (method === 'mpesa') {
      // Navigate to M-Pesa payment page with the selected recharge amount
      navigate('/payments/mpesa', { state: { rechargeAmount: finalAmount } })
      return
    }

    // Crypto flow
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.historyBase }),
      ])

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
      minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Recharge Account</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>🕒</button>
      </div>

      {/* Current Balance Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '24px', textAlign: 'center',
        boxShadow: 'var(--card-shadow)', marginBottom: '24px', border: '1px solid var(--border-main)'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Current Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-heading)' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      {!showCryptoDetails && !submitSuccess ? (
        <>
          {/* Select Amount Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Select Recharge Amount</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {amounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt)
                    setCustomAmount('')
                  }}
                  style={{
                    height: '52px', borderRadius: '12px',
                    border: (selectedAmount === amt && !customAmount) ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
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
              <p style={{ fontSize: '14px', color: 'var(--text-heading)', marginBottom: '8px', fontWeight: 600 }}>Or enter custom amount</p>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
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
                    border: '1px solid var(--border-main)', fontSize: '16px', outline: 'none',
                    fontWeight: 500, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)'
                  }}
                />
                {customAmount && (
                  <button
                    onClick={() => setCustomAmount('')}
                    style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
                  >✕</button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>Minimum deposit is $20</p>
            </div>
          </div>

          {/* Choose Payment Method Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Choose Payment Method</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Crypto Option */}
              <div
                onClick={() => setMethod('crypto')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderRadius: '16px',
                  border: `2px solid ${method === 'crypto' ? 'var(--accent-primary)' : 'transparent'}`,
                  backgroundColor: 'var(--bg-card)', cursor: 'pointer',
                  boxShadow: method === 'crypto' ? '0 0 0 3px rgba(49,151,149,0.12)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', color: 'white', fontWeight: 800
                  }}>₮</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>Crypto (USDT - ERC20)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Tether on Ethereum network</div>
                  </div>
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${method === 'crypto' ? 'var(--accent-primary)' : 'var(--border-main)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {method === 'crypto' && (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                  )}
                </div>
              </div>

              {/* M-Pesa Option */}
              <div
                onClick={() => setMethod('mpesa')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderRadius: '16px',
                  border: `2px solid ${method === 'mpesa' ? '#00AC4F' : 'transparent'}`,
                  backgroundColor: 'var(--bg-card)', cursor: 'pointer',
                  boxShadow: method === 'mpesa' ? '0 0 0 3px rgba(0,172,79,0.12)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', backgroundColor: '#00AC4F', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 900, color: 'white', flexShrink: 0
                  }}>M</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)' }}>M-PESA (Instant KES)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Pay via M-Pesa STK Push — instant confirmation</div>
                  </div>
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${method === 'mpesa' ? '#00AC4F' : 'var(--border-main)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {method === 'mpesa' && (
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00AC4F' }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary and Proceed */}
          <div style={{ marginBottom: '24px', padding: '0 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>Method:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                {method === 'mpesa' ? 'M-PESA (KES)' : 'Crypto (USDT-ERC20)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>Total:</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: method === 'mpesa' ? '#00AC4F' : 'var(--accent-primary)' }}>
                {method === 'mpesa'
                  ? `KES ${(finalAmount * 130).toLocaleString(undefined, { maximumFractionDigits: 0 })} ≈ $${finalAmount.toFixed(2)}`
                  : `$${finalAmount.toFixed(2)}`
                }
              </span>
            </div>

            <button
              onClick={handleProceed}
              disabled={finalAmount < 20}
              style={{
                width: '100%', height: '56px', borderRadius: '16px',
                backgroundColor: finalAmount < 20
                  ? 'var(--text-muted)'
                  : method === 'mpesa' ? '#00AC4F' : 'var(--accent-primary)',
                color: 'white', fontSize: '16px', fontWeight: 700, border: 'none',
                cursor: finalAmount < 20 ? 'not-allowed' : 'pointer',
                boxShadow: finalAmount < 20 ? 'none' : '0 4px 12px rgba(49, 151, 149, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              {method === 'mpesa'
                ? `📱 Pay with M-Pesa`
                : 'Proceed to Deposit'
              }
            </button>
          </div>
        </>
      ) : showCryptoDetails && !submitSuccess ? (
        <div style={{
          backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '24px',
          boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Send exactly</p>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>${finalAmount.toFixed(2)} USDT</h2>
            <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', fontWeight: 600 }}>
              Network: {USDT_NETWORK}
            </p>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '24px',
            padding: '12px', backgroundColor: 'white', borderRadius: '16px', width: 'fit-content', margin: '0 auto 24px'
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px' }} />
          </div>

          <div style={{
            backgroundColor: 'var(--bg-main)', borderRadius: '16px', padding: '16px',
            border: '1px solid var(--border-main)', marginBottom: '24px'
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>USDT Address ({USDT_NETWORK})</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <code style={{
                flex: 1, fontSize: '13px', color: 'var(--text-main)', fontWeight: 700,
                wordBreak: 'break-all', lineHeight: 1.4
              }}>{USDT_ADDRESS}</code>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 16px', borderRadius: '8px', backgroundColor: copied ? '#059669' : 'var(--accent-primary)',
                  color: 'white', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  minWidth: '70px', transition: 'all 0.2s'
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>Upload Payment Proof</p>
            <div style={{
              border: '2px dashed var(--border-main)', borderRadius: '16px', padding: '20px',
              textAlign: 'center', cursor: 'pointer', position: 'relative',
              backgroundColor: proofPreview ? 'transparent' : 'var(--bg-main)'
            }}>
              {proofPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={proofPreview} alt="Proof Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                  <button
                    onClick={() => { setProofFile(null); setProofPreview(null); setUploadedProofUrl(null); }}
                    style={{
                      position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ef4444',
                      color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                      cursor: 'pointer', fontWeight: 800
                    }}
                  >✕</button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, margin: '0 0 4px' }}>Click to upload screenshot</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>JPG, PNG or PDF (Max 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>{error}</p>}
          </div>

          {!uploadedProofUrl ? (
            <button
              onClick={handleUploadProof}
              disabled={uploading || !proofFile}
              style={{
                width: '100%', height: '52px', borderRadius: '16px',
                backgroundColor: (uploading || !proofFile) ? 'var(--text-muted)' : 'var(--text-heading)',
                color: 'white', fontSize: '15px', fontWeight: 700, border: 'none',
                cursor: (uploading || !proofFile) ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Uploading...' : 'Verify Payment Proof'}
            </button>
          ) : (
            <button
              onClick={handleSubmitDeposit}
              disabled={submitting}
              style={{
                width: '100%', height: '52px', borderRadius: '16px',
                backgroundColor: '#059669', color: 'white', fontSize: '15px',
                fontWeight: 700, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Confirm Deposit'}
            </button>
          )}

          <button
            onClick={() => { setShowCryptoDetails(false); setProofFile(null); setProofPreview(null); setUploadedProofUrl(null); }}
            style={{
              width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, marginTop: '16px', cursor: 'pointer'
            }}
          >
            ← Change amount or method
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '40px 24px',
          textAlign: 'center', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)'
        }}>
          <div style={{
            width: '72px', height: '72px', backgroundColor: '#ecfdf5', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', margin: '0 auto 24px', color: '#059669'
          }}>✓</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>Deposit Submitted!</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
            Your deposit of <strong>${finalAmount.toFixed(2)}</strong> has been received. Our team will verify the payment and credit your wallet within 1-2 hours.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', height: '52px', borderRadius: '16px',
              backgroundColor: 'var(--accent-primary)', color: 'white',
              fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-heading)', fontWeight: 600, marginTop: '4px' }}>
        * Funds will be credited after admin approval and payment confirmation.
      </p>

      {/* Deposit History Section */}
      {!showCryptoDetails && !submitSuccess && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Your Deposit History</h3>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading history...</p>
            </div>
          ) : depositHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)' }}>
              {/* Header Row */}
              <div style={{
                backgroundColor: 'var(--bg-main)', padding: '12px 16px',
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px',
                borderBottom: '1px solid var(--border-main)'
              }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Amount</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Date</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Method</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Status</p>
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
                const displayStatus = payment.status === 'pending' ? 'Processing' : (payment.status.charAt(0).toUpperCase() + payment.status.slice(1))
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
                      alignItems: 'center', borderBottom: index < depositHistory.length - 1 ? '1px solid var(--border-main)' : 'none'
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>${payment.amount.toFixed(2)}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{formattedDate}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{payment.payment_method || 'N/A'}</p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: statusColor.bg, color: statusColor.text,
                      padding: '4px 10px', borderRadius: '16px',
                      fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                      width: 'fit-content'
                    }}>
                      <span>{statusColor.icon}</span>
                      {displayStatus}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '20px',
              textAlign: 'center', border: '1px solid var(--border-main)'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No deposit history yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
