import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AndroidAppPrompt from '../components/AndroidAppPrompt'

const rotatingLabels = ['Digital promotion tasks', 'Video reviewing training', 'A clearer daily rhythm', 'Community and referrals']
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
    const timer = window.setInterval(() => setLabelIndex((index) => (index + 1) % rotatingLabels.length), 3200)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (referralCode) localStorage.setItem('pending_referral_code', referralCode)
  }, [referralCode])

  return (
    <div className="kinetiq-landing">
      <AndroidAppPrompt />
      <a className="kinetiq-skip" href="#kinetiq-main">Skip to content</a>
      <header className="kinetiq-header">
        <Link className="kinetiq-brand" to="/" onClick={closeMenu} aria-label="Kinetiq home"><img src="/assets/kinetiq-mark.svg" alt="" /><span>kinetiq</span></Link>
        <button className="kinetiq-menu-button" type="button" aria-expanded={menuOpen} aria-controls="kinetiq-nav" onClick={() => setMenuOpen((open) => !open)}><span className="sr-only">Toggle navigation</span><i /><i /></button>
        <nav id="kinetiq-nav" className={`kinetiq-nav${menuOpen ? ' is-open' : ''}`} aria-label="Public navigation">
          <a href="#approach" onClick={closeMenu}>How it works</a><a href="#workspace" onClick={closeMenu}>Your workspace</a>
          <Link className="kinetiq-login" to={loginPath} onClick={closeMenu}>Sign in</Link><Link className="kinetiq-nav-cta" to={registerPath} onClick={closeMenu}>Create an account <Arrow /></Link>
        </nav>
      </header>
      <main id="kinetiq-main">
        <section className="kinetiq-hero">
          <div className="kinetiq-hero-copy">
            <p className="kinetiq-kicker"><span /> A workspace for work that moves you</p>
            <h1>Make your<br /><em>next move</em><br />count.</h1>
            <p className="kinetiq-intro">Build skills, take on digital promotion tasks, and keep your activity in one clear place. Start with what’s available to you and move forward at your own pace.</p>
            <div className="kinetiq-live-line" aria-live="polite"><span className="kinetiq-live-mark">↗</span><span>{rotatingLabels[labelIndex]}</span><span className="kinetiq-live-index">0{labelIndex + 1} / 04</span></div>
            {referralCode && <p className="kinetiq-invite-note" role="status"><span aria-hidden="true">✓</span> You’ve been invited. Your referral will be carried into registration.</p>}
            <div className="kinetiq-hero-actions"><Link className="kinetiq-primary-cta" to={registerPath}>Find your starting point <Arrow /></Link><Link className="kinetiq-secondary-cta" to={loginPath}>I already have an account <span>→</span></Link></div>
          </div>
          <div className="kinetiq-hero-art" aria-label="A preview of the Kinetiq workspace">
            <div className="kinetiq-art-top"><span>YOUR WORKSPACE</span><span className="kinetiq-status"><i /> READY WHEN YOU ARE</span></div>
            <div className="kinetiq-art-heading"><small>MONDAY / YOUR NEXT STEP</small><strong>Progress,<br />in good order.</strong></div>
            <div className="kinetiq-art-chart" aria-hidden="true"><div className="kinetiq-chart-label"><span>ACTIVITY</span><b>THIS WEEK</b></div><div className="kinetiq-chart-bars"><i /><i /><i /><i /><i /><i /><i /></div><div className="kinetiq-chart-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
            <div className="kinetiq-art-footer"><span className="kinetiq-art-symbol">↗</span><span>Learn the rhythm.<br /><b>Then make it yours.</b></span><span className="kinetiq-art-arrow">→</span></div><span className="kinetiq-art-orbit kinetiq-art-orbit-one" /><span className="kinetiq-art-orbit kinetiq-art-orbit-two" />
          </div>
          <div className="kinetiq-hero-index"><span>01</span><i /><span>04</span><small>SMALL STEPS. REAL MOMENTUM.</small></div>
        </section>
        <section className="kinetiq-strip" aria-label="Workspace areas"><span>ONE MEMBER WORKSPACE</span><div><b>01</b> Learn</div><div><b>02</b> Take action</div><div><b>03</b> Track your progress</div><div><b>04</b> Grow your network</div></section>
        <section id="approach" className="kinetiq-approach"><div className="kinetiq-section-aside"><span>THE KINETIQ APPROACH</span><i>01 — 03</i></div><div className="kinetiq-approach-main"><h2>A little more<br /><em>direction.</em></h2><p className="kinetiq-section-lead">A practical home for the different parts of your journey. Learn the process, see what’s open to you, and keep your account activity close at hand.</p>
          <div className="kinetiq-steps"><article><span>01 / LEARN</span><div className="kinetiq-step-icon">↗</div><h3>Start with context.</h3><p>Training and learning resources help you understand how the platform works before you begin.</p><Link to={registerPath}>Explore the workspace <b>→</b></Link></article><article><span>02 / PARTICIPATE</span><div className="kinetiq-step-icon">◫</div><h3>See the next action.</h3><p>Available tasks, plans, and account tools sit together, with access determined by your account.</p><Link to={registerPath}>Create an account <b>→</b></Link></article><article><span>03 / KEEP TRACK</span><div className="kinetiq-step-icon">⌁</div><h3>Keep your bearings.</h3><p>Review your dashboard, payments, referrals, and learning progress in one member space.</p><Link to={loginPath}>Sign in to continue <b>→</b></Link></article></div>
        </div></section>
        <section id="workspace" className="kinetiq-workspace-band"><div className="kinetiq-workspace-number">02 <i /> YOUR SPACE</div><div><p className="kinetiq-kicker">Clarity, not clutter</p><h2>Everything you need.<br /><em>Nothing to decode.</em></h2><p className="kinetiq-workspace-desc">Your member workspace brings together tasks, training, plan access, payment activity, and referrals. What you can do is always tied to your account and current eligibility.</p><Link className="kinetiq-outline-cta" to={registerPath}>Take a look inside <Arrow /></Link></div><div className="kinetiq-workspace-list"><span><b>A</b> Dashboard & activity</span><span><b>B</b> Tasks & training</span><span><b>C</b> Plans & payments</span><span><b>D</b> Referrals & settings</span></div></section>
        <section id="community" className="kinetiq-quote"><span className="kinetiq-quote-mark">“</span><blockquote>The next step should feel<br /><em>like a step forward.</em></blockquote><p>Join from an invitation or create an account to see the workspace for yourself.</p><Link to={registerPath}>Your next move <span>↗</span></Link></section>
        <section className="kinetiq-final"><div><p className="kinetiq-kicker">Start where you are</p><h2>Make room<br />for <em>momentum.</em></h2></div><div><p>Set up your account, find your bearings, and take it from there.</p><Link className="kinetiq-primary-cta" to={registerPath}>Create your account <Arrow /></Link><Link className="kinetiq-final-login" to={loginPath}>Already a member? Sign in</Link></div></section>
      </main>
      <footer className="kinetiq-footer"><Link className="kinetiq-brand" to="/" aria-label="Kinetiq home"><img src="/assets/kinetiq-mark.svg" alt="" /><span>kinetiq</span></Link><p>Skills, tasks, and progress — in one place.</p><span>© {new Date().getFullYear()} Kinetiq</span></footer>
    </div>
  )
}
