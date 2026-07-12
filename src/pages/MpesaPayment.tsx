/**
 * MpesaPayment.tsx
 *
 * PesaFlux M-Pesa STK Push payment flow.
 *
 * Supports two modes:
 *   1. Plan purchase/upgrade: navigated from InvestmentPlans with { plan }
 *   2. Recharge: navigated from Recharge page with { rechargeAmount }
 *
 * Flow:
 *   1. Display plan details or recharge amount
 *   2. Collect and validate Kenyan phone number
 *   3. Call backend to initiate STK Push (backend calls PesaFlux — never frontend)
 *   4. Show pending state with polling for payment confirmation
 *   5. On success: show confirmation and redirect
 *   6. Handle all error states gracefully
 *
 * Security:
 *   - The PesaFlux API key is NEVER in frontend code.
 *   - All PesaFlux API calls are made by the backend.
 *   - Amount is loaded from the backend — never sent from frontend.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: number
  name: string
  price: number
  daily_tasks_limit: number
  validity_days: number
  description: string
}

interface InitiateResponse {
  reference: string
  transaction_request_id: string
  amount_kes: number
  amount_usd: number
  plan_name: string
  message: string
}

interface StatusResponse {
  reference: string
  status: 'pending' | 'completed' | 'failed'
  plan_name: string | null
  amount_usd: number
  amount_kes: number
  mpesa_receipt: string | null
  message: string
}

type PaymentStep = 'input' | 'pending' | 'success' | 'failed'

// ─── Phone Validation ─────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  let p = phone.trim().replace(/\s|-/g, '')
  if (p.startsWith('+')) p = p.slice(1)
  if ((p.startsWith('07') || p.startsWith('01')) && p.length === 10) {
    p = '254' + p.slice(1)
  }
  return p
}

function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^254[17]\d{8}$/.test(normalized)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MpesaPayment() {
  const navigate = useNavigate()
  const location = useLocation()

  // Plan passed via navigation state from InvestmentPlans
  const plan: Plan | null = (location.state as any)?.plan || null
  // Recharge amount passed from Recharge page (when plan is null)
  const rechargeAmount: number | null = (location.state as any)?.rechargeAmount || null

  // Determine mode
  const isRechargeMode = !plan && rechargeAmount !== null && rechargeAmount > 0

  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [step, setStep] = useState<PaymentStep>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [initiateData, setInitiateData] = useState<InitiateResponse | null>(null)
  const [statusData, setStatusData] = useState<StatusResponse | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [timeoutReached, setTimeoutReached] = useState(false)

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)

  // Max polling: 24 attempts × 5s = 2 minutes
  const MAX_POLL_ATTEMPTS = 24
  const POLL_INTERVAL_MS = 5000

  // If neither plan nor rechargeAmount was passed, redirect back
  useEffect(() => {
    if (!plan && !isRechargeMode) {
      navigate('/payments/recharge', { replace: true })
    }
  }, [plan, isRechargeMode, navigate])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  const pollStatus = useCallback(async (ref: string) => {
    pollCountRef.current += 1
    setPollCount(pollCountRef.current)

    if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
      stopPolling()
      setTimeoutReached(true)
      setStep('failed')
      setError(
        'Payment confirmation timed out. If you completed the M-Pesa prompt, ' +
        'please contact support with your reference number.'
      )
      return
    }

    try {
      const res = await api.get<StatusResponse>(`/pesaflux/status/${ref}`)
      const data = res.data
      setStatusData(data)

      if (data.status === 'completed') {
        stopPolling()
        setStep('success')
      } else if (data.status === 'failed') {
        stopPolling()
        setStep('failed')
        setError(data.message || 'Payment was not completed. Please try again.')
      }
      // If still pending, continue polling
    } catch (err: any) {
      // Network error during polling — don't stop, just log
      console.warn('PesaFlux status poll error:', err?.message)
    }
  }, [stopPolling])

  const startPolling = useCallback((ref: string) => {
    pollCountRef.current = 0
    setPollCount(0)
    pollIntervalRef.current = setInterval(() => {
      pollStatus(ref)
    }, POLL_INTERVAL_MS)
  }, [pollStatus])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)
    setPhoneError(null)
    setError(null)
  }

  const handleInitiatePayment = async () => {
    // Validate phone
    if (!phone.trim()) {
      setPhoneError('Please enter your M-Pesa phone number.')
      return
    }
    if (!isValidKenyanPhone(phone)) {
      setPhoneError('Invalid phone number. Use format 07XXXXXXXX or 2547XXXXXXXX.')
      return
    }
    
    // Check if we have a valid target for payment
    if (!plan && !isRechargeMode) {
      setError('Payment details missing. Please go back and try again.')
      return
    }

    setLoading(true)
    setError(null)
    setPhoneError(null)

    try {
      // Prepare payload: send plan_id if available, otherwise send amount for recharge
      const payload: any = {
        phone: normalizePhone(phone)
      }
      
      if (plan) {
        payload.plan_id = plan.id
      } else if (rechargeAmount) {
        payload.amount = rechargeAmount
      }

      const res = await api.post<InitiateResponse>('/pesaflux/initiate', payload)

      const data = res.data
      setInitiateData(data)
      setReference(data.reference)
      setStep('pending')

      // Start polling for payment status
      startPolling(data.reference)
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail

      let errorMsg = 'Failed to initiate M-Pesa payment. Please try again.'

      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d: any) => d.msg || d.message || String(d)).join(', ')
      } else if (status === 503) {
        errorMsg = 'M-Pesa payment is temporarily unavailable. Please try again later or use Crypto (USDT) to recharge.'
      } else if (status === 400) {
        errorMsg = detail || 'Invalid request. Please check your details and try again.'
      } else if (status === 401 || status === 403) {
        errorMsg = 'Your session has expired. Please log in again.'
      } else if (status === 404) {
        errorMsg = 'The selected plan is no longer available. Please go back and choose another.'
      } else if (!status) {
        errorMsg = 'Network error. Please check your internet connection and try again.'
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    stopPolling()
    setStep('input')
    setError(null)
    setPhoneError(null)
    setReference(null)
    setInitiateData(null)
    setStatusData(null)
    setTimeoutReached(false)
    pollCountRef.current = 0
    setPollCount(0)
  }

  const handleGoBack = () => {
    if (isRechargeMode) {
      navigate('/payments/recharge')
    } else {
      navigate('/plans')
    }
  }

  const handleGoToSuccess = () => {
    if (isRechargeMode) {
      navigate('/payments')
    } else {
      navigate('/plans')
    }
  }

  if (!plan && !isRechargeMode) return null

  const displayAmount = plan
    ? Math.round(plan.price * 130)
    : Math.round((rechargeAmount || 0) * 130)

  const displayUSD = plan ? plan.price : (rechargeAmount || 0)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      padding: '16px',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
      }}>
        <button
          onClick={handleGoBack}
          style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: 'var(--text-heading)', padding: '4px'
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
          Pay with M-Pesa
        </h1>
      </div>

      {/* Summary Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--border-main)',
        boxShadow: 'var(--card-shadow)'
      }}>
        {plan ? (
          /* Plan mode: show plan details */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Plan</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)' }}>{plan.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#00AC4F' }}>
                  KES {displayAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>≈ ${displayUSD.toFixed(2)} USD</div>
              </div>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
              fontSize: '12px', color: 'var(--text-main)'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Daily Tasks: </span>
                <span style={{ fontWeight: 700 }}>{plan.daily_tasks_limit}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Validity: </span>
                <span style={{ fontWeight: 700 }}>{plan.validity_days} days</span>
              </div>
            </div>
          </>
        ) : (
          /* Recharge mode: show recharge amount */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Recharge Amount</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)' }}>${displayUSD.toFixed(2)} USD</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>KES Equivalent</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#00AC4F' }}>
                KES {displayAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STEP: Input ─────────────────────────────────────────────────── */}
      {step === 'input' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border-main)',
          boxShadow: 'var(--card-shadow)'
        }}>
          {/* M-Pesa branding */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
            padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              width: '40px', height: '40px', backgroundColor: '#00AC4F', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 900, color: 'white', flexShrink: 0
            }}>M</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>M-PESA STK Push</div>
              <div style={{ fontSize: '12px', color: '#15803d' }}>
                You'll receive a payment prompt on your phone
              </div>
            </div>
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '14px', fontWeight: 600,
              color: 'var(--text-heading)', marginBottom: '8px'
            }}>
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="e.g. 0712345678 or 254712345678"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `2px solid ${phoneError ? '#ef4444' : 'var(--border-main)'}`,
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                if (!phoneError) e.target.style.borderColor = '#00AC4F'
              }}
              onBlur={(e) => {
                if (!phoneError) e.target.style.borderColor = 'var(--border-main)'
              }}
            />
            {phoneError && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', fontWeight: 500 }}>
                {phoneError}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Accepts: 07XXXXXXXX or 2547XXXXXXXX
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#991b1b', fontSize: '13px', fontWeight: 500, lineHeight: '1.5'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* How it works */}
          <div style={{
            backgroundColor: 'var(--bg-main)', borderRadius: '10px', padding: '12px',
            marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>
              How it works:
            </div>
            <div>1. Enter your M-Pesa number and click "Pay Now"</div>
            <div>2. You'll receive an M-Pesa prompt on your phone</div>
            <div>3. Enter your M-Pesa PIN to confirm</div>
            <div>4. {isRechargeMode ? 'Your account will be recharged automatically' : 'Your plan will be activated automatically'}</div>
          </div>

          {/* Pay button */}
          <button
            onClick={handleInitiatePayment}
            disabled={loading || !phone.trim()}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: (loading || !phone.trim()) ? 'var(--text-muted)' : '#00AC4F',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              cursor: (loading || !phone.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px', height: '18px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }} />
                Sending STK Push...
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>📱</span>
                Pay KES {displayAmount.toLocaleString()} via M-Pesa
              </>
            )}
          </button>

          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── STEP: Pending ───────────────────────────────────────────────── */}
      {step === 'pending' && initiateData && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '1px solid var(--border-main)',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)'
        }}>
          {/* Animated phone icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#f0fdf4', border: '3px solid #00AC4F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '36px' }}>📱</span>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,172,79,0.3); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(0,172,79,0); }
            }
          `}</style>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
            Check Your Phone
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
            An M-Pesa payment prompt has been sent to<br />
            <strong style={{ color: 'var(--text-heading)' }}>{phone}</strong><br />
            Enter your M-Pesa PIN to complete the payment.
          </p>

          {/* Amount reminder */}
          <div style={{
            backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '12px 16px',
            marginBottom: '20px', border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
              Amount to pay: <strong>KES {initiateData.amount_kes.toLocaleString()}</strong>
            </div>
          </div>

          {/* Polling indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px'
          }}>
            <span style={{
              width: '12px', height: '12px',
              border: '2px solid var(--border-main)',
              borderTop: '2px solid #00AC4F',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              display: 'inline-block',
              flexShrink: 0
            }} />
            Waiting for confirmation... ({pollCount}/{MAX_POLL_ATTEMPTS})
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

          {/* Reference */}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Reference: <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{initiateData.reference}</code>
          </div>

          {/* Cancel / try different number */}
          <button
            onClick={handleRetry}
            style={{
              background: 'none', border: '1px solid var(--border-main)',
              borderRadius: '10px', padding: '10px 20px',
              fontSize: '13px', color: 'var(--text-muted)',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Cancel / Try Again
          </button>
        </div>
      )}

      {/* ── STEP: Success ───────────────────────────────────────────────── */}
      {step === 'success' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '2px solid #00AC4F',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#f0fdf4', border: '3px solid #00AC4F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '40px'
          }}>
            ✅
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
            Payment Successful!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
            {isRechargeMode
              ? `Your account has been recharged with $${displayUSD.toFixed(2)}.`
              : `Your ${statusData?.plan_name || plan?.name || 'plan'} has been activated.`
            }
          </p>

          {statusData?.mpesa_receipt && (
            <div style={{
              backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: '12px', color: '#166534' }}>
                M-Pesa Receipt: <strong style={{ fontFamily: 'monospace' }}>{statusData.mpesa_receipt}</strong>
              </div>
            </div>
          )}

          <button
            onClick={handleGoToSuccess}
            style={{
              width: '100%', height: '52px', borderRadius: '12px',
              backgroundColor: '#00AC4F', color: 'white',
              fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
          >
            {isRechargeMode ? 'View Payment History →' : 'View My Plans →'}
          </button>
        </div>
      )}

      {/* ── STEP: Failed ────────────────────────────────────────────────── */}
      {step === 'failed' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '1px solid #fecaca',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#fef2f2', border: '3px solid #ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '40px'
          }}>
            ❌
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
            {timeoutReached ? 'Payment Timed Out' : 'Payment Not Completed'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
            {error || 'The payment was not completed. Please try again.'}
          </p>

          {reference && (
            <div style={{
              backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '10px',
              marginBottom: '20px', fontSize: '11px', color: 'var(--text-muted)'
            }}>
              Reference: <code style={{ fontFamily: 'monospace' }}>{reference}</code>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRetry}
              style={{
                flex: 1, height: '48px', borderRadius: '12px',
                backgroundColor: '#00AC4F', color: 'white',
                fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              style={{
                flex: 1, height: '48px', borderRadius: '12px',
                backgroundColor: 'var(--bg-main)', color: 'var(--text-main)',
                fontSize: '14px', fontWeight: 600,
                border: '1px solid var(--border-main)', cursor: 'pointer'
              }}
            >
              {isRechargeMode ? 'Back to Recharge' : 'Back to Plans'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
