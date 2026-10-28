import { useEffect, useRef, useState } from 'react'

const APP_PACKAGE_ID = 'site.adpulseaiglobaltech.app'
const PROMPT_SESSION_KEY = 'adpulseai-app-browser-choice'

function isStandaloneExperience() {
  const displayModes = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay']
  const hasStandaloneMode = displayModes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches)
  const launchedFromTwa = document.referrer.startsWith('android-app://')
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return hasStandaloneMode || launchedFromTwa || iosStandalone
}

function isAndroidRegularBrowser() {
  const userAgent = navigator.userAgent || ''
  const isAndroid = /Android/i.test(userAgent)
  const isEmbeddedWebView = /;\s*wv\)/i.test(userAgent) || /\bVersion\/\d[\d.]*.*\bChrome\/\d/i.test(userAgent) && !/Mobile Safari/i.test(userAgent)
  return isAndroid && !isEmbeddedWebView && !isStandaloneExperience()
}

function rememberChoice() {
  try {
    window.sessionStorage.setItem(PROMPT_SESSION_KEY, '1')
  } catch {
    // Private browsing modes may block sessionStorage; the prompt still works for this render.
  }
}

export default function AndroidAppPrompt() {
  const [open, setOpen] = useState(false)
  const openAppButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(PROMPT_SESSION_KEY)) return
    } catch {
      // Continue with device detection when sessionStorage is unavailable.
    }

    if (!isAndroidRegularBrowser()) return

    const frame = window.requestAnimationFrame(() => setOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    openAppButtonRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        rememberChoice()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!open) return null

  const continueInBrowser = () => {
    rememberChoice()
    setOpen(false)
  }

  const openApp = () => {
    rememberChoice()

    const currentUrl = window.location.href
    const intentTarget = `${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`
    const intentUrl = `intent://${intentTarget}#Intent;scheme=https;package=${APP_PACKAGE_ID};S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`
    let pageLeft = false

    const handlePageHide = () => {
      pageLeft = true
    }
    window.addEventListener('pagehide', handlePageHide, { once: true })

    window.location.href = intentUrl

    // Some browsers do not honor browser_fallback_url. Keep the current URL, including referral codes,
    // as the fallback and avoid leaving the visitor on a broken intent URL.
    window.setTimeout(() => {
      window.removeEventListener('pagehide', handlePageHide)
      if (!pageLeft && document.visibilityState !== 'hidden') {
        window.location.replace(currentUrl)
      }
    }, 1600)
  }

  return (
    <div className="android-app-prompt-backdrop" role="presentation">
      <section
        className="android-app-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="android-app-prompt-title"
        aria-describedby="android-app-prompt-description"
      >
        <div className="android-app-prompt-brand" aria-hidden="true">
          <img src="/assets/pacecraft-icon-192-harbor.png" alt="" />
          <span>Pacecraft</span>
        </div>
        <p className="android-app-prompt-overline">Choose how to continue</p>
        <h2 id="android-app-prompt-title">Open Pacecraft your way.</h2>
        <p id="android-app-prompt-description">
          Use the Pacecraft app for a focused mobile experience, or continue securely in your browser.
        </p>
        <div className="android-app-prompt-actions">
          <button ref={openAppButtonRef} className="android-app-prompt-primary" type="button" onClick={openApp}>
            Open Pacecraft app <span aria-hidden="true">↗</span>
          </button>
          <button className="android-app-prompt-secondary" type="button" onClick={continueInBrowser}>
            Continue in browser
          </button>
        </div>
      </section>
    </div>
  )
}
