import { useEffect, useState } from 'react'

type InstallOutcome = 'accepted' | 'dismissed'
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: InstallOutcome }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
let listenersBound = false

function notify() {
  listeners.forEach((listener) => listener())
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

function bindPwaEvents() {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true
  installed = isStandalone()
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferredPrompt = null
    notify()
  })
}

function getPlatform(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'desktop'
}

if (typeof window !== 'undefined') {
  bindPwaEvents()
}

export function usePwaInstall() {
  const [, rerender] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    bindPwaEvents()
    const listener = () => rerender((value) => value + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const installApp = async () => {
    if (installed) return
    if (!deferredPrompt) {
      setHelpOpen(true)
      return
    }
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      deferredPrompt = null
      rerender((value) => value + 1)
    } catch {
      deferredPrompt = null
      setHelpOpen(true)
    }
  }

  return {
    canInstall: !installed,
    nativeInstallAvailable: Boolean(deferredPrompt),
    helpOpen,
    platform: typeof navigator === 'undefined' ? 'desktop' : getPlatform(),
    installApp,
    closeHelp: () => setHelpOpen(false),
  }
}

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { canInstall, installApp, helpOpen, closeHelp, platform, nativeInstallAvailable } = usePwaInstall()
  if (!canInstall) return null

  return (
    <>
      <button type="button" className={compact ? 'pwa-install-button pwa-install-button--compact' : 'pwa-install-button'} onClick={() => void installApp()} aria-label="Install AdPulseAI App">
        <span aria-hidden="true">↓</span>
        <span>Install App</span>
      </button>
      {helpOpen && (
        <div className="pwa-modal-backdrop" role="presentation" onMouseDown={closeHelp}>
          <section className="pwa-modal" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="pwa-modal__icon" aria-hidden="true">↓</div>
            <h2 id="pwa-install-title">Install AdPulseAI App</h2>
            <p>Get faster access to AdPulseAI directly from your device.</p>
            <ol>
              {platform === 'ios' && <li>Tap the <strong>Share</strong> button in Safari.</li>}
              {platform === 'ios' && <li>Choose <strong>Add to Home Screen</strong>, then confirm.</li>}
              {platform === 'android' && <li>Open your browser menu.</li>}
              {platform === 'android' && <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>}
              {platform === 'desktop' && <li>Select the <strong>Install</strong> icon in your browser address bar.</li>}
              {platform === 'desktop' && <li>If it is not visible, open the browser menu and choose <strong>Install AdPulseAI</strong>.</li>}
            </ol>
            {!nativeInstallAvailable && <p className="pwa-modal__note">Your browser does not offer a direct install prompt right now, so use the steps above.</p>}
            <button type="button" className="pwa-modal__close" onClick={closeHelp}>Close</button>
          </section>
        </div>
      )}
    </>
  )
}

export function PWAInstallCard() {
  const { canInstall, installApp, helpOpen, closeHelp, platform, nativeInstallAvailable } = usePwaInstall()
  if (!canInstall) return null

  return (
    <>
      <section className="pwa-install-card" aria-labelledby="pwa-card-title">
        <div className="pwa-install-card__copy">
          <div className="pwa-install-card__icon" aria-hidden="true">↓</div>
          <div>
            <h2 id="pwa-card-title">Install AdPulseAI App</h2>
            <p>Get faster access to AdPulseAI directly from your device.</p>
          </div>
        </div>
        <button type="button" className="pwa-install-button" onClick={() => void installApp()}>Install App</button>
      </section>
      {helpOpen && (
        <div className="pwa-modal-backdrop" role="presentation" onMouseDown={closeHelp}>
          <section className="pwa-modal" role="dialog" aria-modal="true" aria-labelledby="pwa-card-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="pwa-modal__icon" aria-hidden="true">↓</div>
            <h2 id="pwa-card-modal-title">Install AdPulseAI App</h2>
            <p>Get faster access to AdPulseAI directly from your device.</p>
            <ol>
              {platform === 'ios' && <li>Tap <strong>Share</strong> in Safari, then choose <strong>Add to Home Screen</strong>.</li>}
              {platform === 'android' && <li>Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>}
              {platform === 'desktop' && <li>Use the <strong>Install</strong> icon in the address bar or browser menu.</li>}
            </ol>
            {!nativeInstallAvailable && <p className="pwa-modal__note">The browser install prompt is not available yet. You can still install AdPulseAI using these instructions.</p>}
            <button type="button" className="pwa-modal__close" onClick={closeHelp}>Close</button>
          </section>
        </div>
      )}
    </>
  )
}

export function OfflineStatus() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null
  return (
    <div className="pwa-offline-banner" role="status">
      <strong>You are offline.</strong> AdPulseAI is showing the app shell only. Do not submit payments or other actions until your connection returns.
    </div>
  )
}
