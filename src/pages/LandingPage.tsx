import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProductDemo from '../components/demo/ProductDemo'

const rotatingLabels = ['Video Reviewing Mastery', 'Your daily task queue', 'Wallet & payment history', 'Invites & community']
const examplePlans = [
  { name: 'Intern', price: '$0', detail: '3-day trial · up to 2 tasks/day' },
  { name: 'LV1', price: '$20', detail: '60 days · up to 2 tasks/day' },
  { name: 'LV2', price: '$50', detail: '60 days · up to 5 tasks/day' },
  { name: 'LV3', price: '$100', detail: '60 days · up to 7 tasks/day' },
  { name: 'LV4', price: '$150', detail: '60 days · up to 10 tasks/day' },
  { name: 'LV5', price: '$200', detail: '60 days · up to 15 tasks/day' },
]

function Arrow() { return <span aria-hidden="true">↗</span> }

export default function LandingPage() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [labelIndex, setLabelIndex] = useState(0)
  const closeMenu = () => setMenuOpen(false)
  const referralCode = new URLSearchParams(location.search).get('ref')?.trim() || ''
  const loginPath = referralCode ? `/login?ref=${encodeURIComponent(referralCode)}` : '/login'
  const registerPath = referralCode ? `/login?mode=register&ref=${encodeURIComponent(referralCode)}` : '/login?mode=register'

  useEffect(() => {
    const timer = window.setInterval(() => setLabelIndex((index) => (index + 1) % rotatingLabels.length), 3600)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (referralCode) localStorage.setItem('pending_referral_code', referralCode)
  }, [referralCode])

  return (
    <div className="reference-landing">
      <a className="reference-skip" href="#reference-main">Skip to content</a>
      <header className="reference-header">
        <Link className="reference-brand" to="/" onClick={closeMenu} aria-label="AdPulseAI home">
          <img src="/assets/logo.png" alt="" /><span>AdPulse<span>AI</span></span>
        </Link>
        <button className="reference-menu-button" type="button" aria-expanded={menuOpen} aria-controls="reference-nav" onClick={() => setMenuOpen((open) => !open)}>
          <span className="sr-only">Toggle navigation</span><i /><i />
        </button>
        <nav id="reference-nav" className={`reference-nav${menuOpen ? ' is-open' : ''}`} aria-label="Public navigation">
          <a className="reference-nav-demo" href="#demo" onClick={closeMenu}>Try the demo <span aria-hidden="true">↗</span></a>
          <a href="#platform" onClick={closeMenu}>How it works</a>
          <a href="#plans" onClick={closeMenu}>Plans</a>
          <Link className="reference-nav-login" to={loginPath} onClick={closeMenu}>Log in</Link>
          <Link className="reference-nav-cta" to={registerPath} onClick={closeMenu}>Get started <Arrow /></Link>
        </nav>
      </header>

      <main id="reference-main">
        <section className="reference-hero">
          <p className="reference-overline"><span className="reference-overline-dot" /> Your workspace. Your next step.</p>
          <h1>Your progress<br /><em>builds momentum.</em></h1>
          <p className="reference-hero-description">Learn the workflow. Review available videos. Keep your tasks,<br className="reference-desktop-break" /> wallet activity, and invites in one clear place.</p>
          <div className="reference-rotator"><span className="reference-rotator-dot" />{rotatingLabels[labelIndex]}<span className="reference-rotator-arrow">↗</span></div>
          {referralCode && <p className="reference-invite-note" role="status"><span aria-hidden="true">✓</span> Your invitation is ready. Explore the demo, then create your account.</p>}
          <div className="reference-hero-actions">
            <a className="reference-demo-cta" href="#demo"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 4.5v15l12-7.5z" /></svg> Explore the workspace <Arrow /></a>
            <Link className="reference-secondary-cta" to={registerPath}>Create your account <span aria-hidden="true">→</span></Link>
          </div>
          <p className="reference-demo-assurance">Interactive preview <span aria-hidden="true">·</span> No sign-up needed <span aria-hidden="true">·</span> Sample data only</p>
        </section>

        <ProductDemo />

        <section className="reference-trust" aria-label="Platform areas">
          <p>One workspace. A connected journey.</p>
          <div className="reference-trust-row"><span>TRAINING</span><span>TASKS</span><span>PLANS</span><span>PAYMENTS</span><span>INVITES</span></div>
        </section>

        <section id="platform" className="reference-section reference-platform">
          <div className="reference-section-intro"><p className="reference-overline">From first look to daily workflow</p><h2>A clear path.<br /><em>Not a guessing game.</em></h2><p>Start with Video Reviewing Mastery. Explore your plan access, open available tasks, and follow the results in your member dashboard.</p></div>
          <div className="reference-feature-grid">
            <article className="reference-feature-card reference-feature-card-image"><img src="/assets/adpulseai-hero.png" loading="lazy" alt="AdPulseAI workspace illustrated on a laptop and phone" /><div><span>01 / GET ORIENTED</span><strong>Learn the workflow.</strong></div></article>
            <article className="reference-feature-card"><span className="reference-card-number">02 / DO THE WORK</span><h3>One task at a time.</h3><p>Your task queue shows the available video, its reward, and its status. Open a task, watch the video, and submit completion.</p><a href="#demo">Try it in the demo <span aria-hidden="true">→</span></a></article>
            <article className="reference-feature-card reference-feature-card-accent"><span className="reference-card-number">03 / SEE THE RESULT</span><h3>Keep the details clear.</h3><p>Separate deposit and withdrawal wallets. Task activity and invite history. A dashboard that keeps the next action in view.</p><Link to={registerPath}>Open your own workspace <span aria-hidden="true">→</span></Link></article>
          </div>
        </section>

        <section id="community" className="reference-quote-section">
          <p className="reference-overline">Clarity, from the start</p><blockquote>See how it works.<br /><em>Then make it yours.</em></blockquote><p>The demo is a safe first look at the member experience. Your real task availability, rewards, plan terms, and payment status are shown in your account.</p><a className="reference-secondary-cta" href="#demo">Back to the interactive demo <span aria-hidden="true">↑</span></a>
        </section>

        <section id="plans" className="reference-section reference-plans">
          <div className="reference-section-intro"><p className="reference-overline">Access that fits your next step</p><h2>Choose your<br /><em>starting point.</em></h2><p>Begin with the trial or explore plan access. These examples reflect the API’s baseline catalog; current availability, validity, and task limits are confirmed inside your account.</p><p className="reference-plan-note">Plan access does not guarantee task availability or earnings. Purchases and upgrades take place only after sign-in.</p></div>
          <div className="reference-plans-list">{examplePlans.map((plan) => <div className="reference-plan" key={plan.name}><strong>{plan.name}</strong><b>{plan.price}</b><span>{plan.detail}</span><Link to={loginPath}>View plan <span aria-hidden="true">→</span></Link></div>)}</div>
        </section>

        <section className="reference-final"><p className="reference-overline">You have seen the workflow</p><h2>Make progress<br /><em>visible.</em></h2><p>Move from the preview to your own AdPulseAI workspace.</p><Link className="reference-primary-cta" to={registerPath}>Create your account <Arrow /></Link></section>
      </main>

      <footer className="reference-footer"><Link className="reference-brand" to="/" aria-label="AdPulseAI home"><img src="/assets/logo.png" alt="" /><span>AdPulse<span>AI</span></span></Link><p>Training, video tasks, and a clearer member workspace.</p><span>© {new Date().getFullYear()} AdPulseAI</span></footer>
    </div>
  )
}
