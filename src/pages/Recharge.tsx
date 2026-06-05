import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
const USDT_NETWORK = 'ERC20 (Ethereum)'

export default function Recharge() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('crypto')
  const [copied, setCopied] = useState(false)
  const [showCryptoDetails, setShowCryptoDetails] = useState(false)

  const amounts = [20, 50, 100, 150, 200]

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setBalance(res.data.deposit_wallet_balance)
    }).catch(console.error)
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
          <span style={{ fontWeight: 700, color: '#111827' }}>$0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Total Credit:</span>
          <span style={{ fontWeight: 800, color: '#111827' }}>${finalAmount.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Proceed Button */}
      {!showCryptoDetails && (
        <button
          disabled={finalAmount < 20}
          onClick={handleProceed}
          style={{
            width: '100%', padding: '18px', borderRadius: '30px',
            backgroundColor: finalAmount < 20 ? '#a0aec0' : '#319795',
            color: 'white', fontSize: '17px', fontWeight: 700, border: 'none',
            cursor: finalAmount < 20 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(49, 151, 149, 0.3)',
            marginBottom: '12px'
          }}
        >
          Proceed to pay ${finalAmount.toFixed(2)} USD
        </button>
      )}

      {/* ── USDT Payment Details Panel ── */}
      {showCryptoDetails && (
        <div style={{
          backgroundColor: 'white', borderRadius: '24px', padding: '24px',
          border: '2px solid #319795', marginBottom: '16px',
          boxShadow: '0 4px 20px rgba(49,151,149,0.15)'
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>₮</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Send {finalAmount.toFixed(2)} USDT
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Network: <strong style={{ color: '#319795' }}>{USDT_NETWORK}</strong>
            </p>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{
              padding: '12px', borderRadius: '16px', border: '2px solid #e0f2f1',
              backgroundColor: '#f0fdfa', display: 'inline-block'
            }}>
              <img
                src={qrUrl}
                alt="USDT ERC20 QR Code"
                width={180}
                height={180}
                style={{ display: 'block', borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* Wallet Address */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
              USDT (ERC20) Wallet Address
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: '#f8fafc', borderRadius: '12px',
              border: '1px solid #e2e8f0', padding: '12px 14px'
            }}>
              <span style={{
                flex: 1, fontSize: '13px', fontWeight: 600, color: '#1e293b',
                wordBreak: 'break-all', fontFamily: 'monospace', letterSpacing: '0.02em'
              }}>
                {USDT_ADDRESS}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0, padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: copied ? '#22c55e' : '#319795',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: '12px', padding: '12px 14px', marginBottom: '16px'
          }}>
            <p style={{ fontSize: '12px', color: '#92400e', margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
              ⚠️ <strong>Important:</strong> Only send <strong>USDT on the ERC20 (Ethereum) network</strong> to this address.
              Sending any other token or using a different network will result in permanent loss of funds.
            </p>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>How to complete your payment:</p>
            {[
              `Send exactly ${finalAmount.toFixed(2)} USDT to the address above`,
              'Use the ERC20 (Ethereum) network only',
              'Your balance will be credited after 1–3 network confirmations',
              'Contact support if funds do not appear within 30 minutes',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#319795',
                  color: 'white', fontSize: '11px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>{i + 1}</div>
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
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
              onClick={() => navigate('/payments')}
              style={{
                flex: 2, padding: '14px', borderRadius: '20px',
                backgroundColor: '#319795', border: 'none',
                color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(49,151,149,0.3)'
              }}
            >
              I've Sent the Payment ✓
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
        * Funds will be credited after successful payment confirmation.
      </p>
    </div>
  )
}
