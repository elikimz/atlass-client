import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const rotatingLabels = ['Digital Promotion Tasks', 'Video Reviewing Mastery', 'Flexible Daily Work', 'Invite & Community Growth']
const plans = [
  { name: 'Internship', price: '$0', detail: '3 days · 2 daily tasks' },
  { name: 'Level 1', price: '$20', detail: '365 days · 2 daily tasks' },
  { name: 'Level 2', price: '$50', detail: '365 days · 5 daily tasks' },
  { name: 'Level 3', price: '$100', detail: '365 days · 10 daily tasks' },
  { name: 'Level 4', price: '$150', detail: '365 days · 14 daily tasks' },
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
    const timer = window.setInterval(() => setLabelIndex((index) => (index + 1) % rotatingLabels.length), 2600)
    return () => window.clearInterval(timer)
  }, [])

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
          <a href="#platform" onClick={closeMenu}>Platform</a>
          <a href="#plans" onClick={closeMenu}>Plans</a>
          <a href="#community" onClick={closeMenu}>Community</a>
          <Link className="reference-nav-login" to={loginPath} onClick={closeMenu}>Log in</Link>
          <Link className="reference-nav-cta" to={registerPath} onClick={closeMenu}>Get started <Arrow /></Link>
        </nav>
      </header>

      <main id="reference-main">
        <section className="reference-hero">
          <p className="reference-overline">A focused workspace for digital progress</p>
          <h1>Your progress<br /><em>builds momentum.</em></h1>
          <p className="reference-subtitle">TRAIN. WORK. EARN. GROW.</p>
          <div className="reference-rotator" aria-live="polite"><span className="reference-rotator-dot" />{rotatingLabels[labelIndex]}<span className="reference-rotator-arrow">↗</span></div>
          {referralCode && <p className="reference-invite-note" role="status"><span aria-hidden="true">✓</span> You’ve been invited to join AdPulseAI. Your invitation is ready for registration.</p>}
          <div className="reference-hero-actions">
            <Link className="reference-primary-cta" to={registerPath}>Create your account <Arrow /></Link>
            <Link className="reference-secondary-cta" to={loginPath}>Already a member? Log in <span>→</span></Link>
          </div>
          <div className="reference-scroll-note"><span /> Scroll to explore</div>
        </section>

        <section className="reference-trust" aria-label="Platform areas">
          <p>Everything you need to keep moving</p>
          <div className="reference-trust-row"><span>TRAINING</span><span>TASKS</span><span>PLANS</span><span>PAYMENTS</span><span>INVITES</span></div>
        </section>

        <section id="platform" className="reference-section reference-platform">
          <div className="reference-section-intro"><p className="reference-overline">The AdPulseAI workspace</p><h2>Less noise.<br /><em>More direction.</em></h2><p>One member workspace for learning the workflow, viewing available tasks, managing access, tracking payments, and staying connected to your invite activity.</p></div>
          <div className="reference-feature-grid">
            <article className="reference-feature-card reference-feature-card-image"><img src="/assets/adpulseai-hero.png" alt="AdPulseAI workspace on a laptop and phone" /><div><span>01</span><strong>Work from one clear place.</strong></div></article>
            <article className="reference-feature-card"><span className="reference-card-number">02</span><h3>Learn the path.</h3><p>Start with Video Reviewing Mastery, then move into the tasks and plan access available to you.</p><Link to={registerPath}>Start your account <span>→</span></Link></article>
            <article className="reference-feature-card reference-feature-card-accent"><span className="reference-card-number">03</span><h3>Keep progress visible.</h3><p>Return to a focused dashboard with your training, tasks, wallet activity, and invite history together.</p><Link to={loginPath}>View the workspace <span>→</span></Link></article>
          </div>
        </section>

        <section id="community" className="reference-quote-section">
          <div className="reference-quote-mark">“</div><blockquote>The next action<br /><em>should always be clear.</em></blockquote><p>AdPulseAI keeps the journey understandable from your first registration through your daily workspace.</p>
        </section>

        <section id="plans" className="reference-section reference-plans">
          <div className="reference-section-intro"><p className="reference-overline">Access that fits your next step</p><h2>Choose your<br /><em>starting point.</em></h2><p>Plans currently available inside the application. Purchase and upgrades happen securely after sign in.</p></div>
          <div className="reference-plans-list">{plans.map((plan) => <div className="reference-plan" key={plan.name}><strong>{plan.name}</strong><b>{plan.price}</b><span>{plan.detail}</span><Link to={loginPath}>View plan <span>→</span></Link></div>)}</div>
        </section>

        <section className="reference-final"><p className="reference-overline">Your next step</p><h2>Make progress<br /><em>visible.</em></h2><p>Open your AdPulseAI workspace and begin at your own pace.</p><Link className="reference-primary-cta" to={registerPath}>Join AdPulseAI <Arrow /></Link></section>
      </main>

      <footer className="reference-footer"><Link className="reference-brand" to="/" aria-label="AdPulseAI home"><img src="/assets/logo.png" alt="" /><span>AdPulse<span>AI</span></span></Link><p>Digital promotion tasks, training, and workspace clarity.</p><span>© {new Date().getFullYear()} AdPulseAI</span></footer>
    </div>
  )
}
