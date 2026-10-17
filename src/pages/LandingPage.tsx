import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const plans = [
  { name: 'Intern', price: 'Free', detail: '3-day trial', tasks: '2 daily tasks' },
  { name: 'LV1', price: '$20', detail: '60-day plan', tasks: '2 daily tasks' },
  { name: 'LV2', price: '$50', detail: '60-day plan', tasks: '5 daily tasks' },
  { name: 'LV3', price: '$100', detail: '60-day plan', tasks: '7 daily tasks' },
  { name: 'LV4', price: '$150', detail: '60-day plan', tasks: '10 daily tasks' },
]

function Mark({ children }: { children: ReactNode }) {
  return <span className="landing-mark" aria-hidden="true">{children}</span>
}

function ProductPreview() {
  return (
    <div className="landing-preview" aria-label="Illustrated preview of the AdPulseAI workspace">
      <div className="landing-preview-topbar">
        <div className="landing-preview-brand"><img src="/assets/logo.png" alt="" /> <span>AdPulseAI</span></div>
        <span className="landing-preview-status"><i /> Workspace</span>
      </div>
      <div className="landing-preview-body">
        <aside className="landing-preview-rail" aria-hidden="true">
          <span className="is-active" /><span /><span /><span /><span />
        </aside>
        <div className="landing-preview-content">
          <div className="landing-preview-heading">
            <div><span className="landing-eyebrow">TODAY'S WORKSPACE</span><strong>Good morning, member.</strong></div>
            <span className="landing-preview-avatar">AM</span>
          </div>
          <div className="landing-preview-stats">
            <div><span>Active tasks</span><strong>03</strong><small>Ready to review</small></div>
            <div><span>Training</span><strong>01</strong><small>Course available</small></div>
            <div><span>Current plan</span><strong>LV1</strong><small>60-day access</small></div>
          </div>
          <div className="landing-preview-work">
            <div className="landing-preview-work-head"><span>Available task</span><em>Open</em></div>
            <strong>Video Reviewing Mastery</strong>
            <p>Complete the training path, then access your available promotion tasks.</p>
            <div className="landing-preview-progress"><span /><i /></div>
            <div className="landing-preview-work-foot"><small>Training · 15 mins</small><b>View workspace →</b></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">Skip to content</a>
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link className="landing-wordmark" to="/" onClick={closeMenu} aria-label="AdPulseAI home">
            <img src="/assets/logo.png" alt="" />
            <span>AdPulse<span>AI</span></span>
          </Link>
          <button className="landing-menu-button" type="button" aria-expanded={menuOpen} aria-controls="landing-nav" onClick={() => setMenuOpen((open) => !open)}>
            <span className="sr-only">Toggle navigation</span><i /><i /><i />
          </button>
          <nav id="landing-nav" className={`landing-nav${menuOpen ? ' is-open' : ''}`} aria-label="Public navigation">
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#plans" onClick={closeMenu}>Plans</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            <span className="landing-nav-divider" aria-hidden="true" />
            <ThemeToggle />
            <Link className="landing-login-link" to="/login" onClick={closeMenu}>Log in</Link>
            <Link className="landing-button landing-button-small" to="/login?mode=register" onClick={closeMenu}>Get started <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </header>

      <main id="landing-main">
        <section className="landing-hero landing-section-shell">
          <div className="landing-hero-copy">
            <p className="landing-kicker"><span /> A clearer way to work through digital promotion</p>
            <h1>Make progress<br /><em>visible.</em></h1>
            <p className="landing-hero-lede">AdPulseAI brings tasks, training, plans, payments, and invites into one focused workspace built for consistent daily progress.</p>
            <div className="landing-hero-actions">
              <Link className="landing-button" to="/login?mode=register">Create your account <span aria-hidden="true">↗</span></Link>
              <Link className="landing-text-link" to="/login">Already a member? Log in <span aria-hidden="true">→</span></Link>
            </div>
            <div className="landing-hero-note"><Mark>✓</Mark><span>Start with training. Move into plans and available tasks when you are ready.</span></div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-visual-label"><span>01</span><span>THE WORKSPACE</span></div>
            <div className="landing-hero-image-frame">
              <img src="/assets/adpulseai-hero.png" alt="Laptop and phone showing a blue-lit AdPulseAI workspace" />
              <span className="landing-image-badge">A focused workspace for daily progress</span>
            </div>
            <div className="landing-preview-overlay"><ProductPreview /></div>
            <div className="landing-visual-caption"><span>Designed for the work in front of you.</span><span>AdPulseAI / 2026</span></div>
          </div>
        </section>

        <section className="landing-editorial-band">
          <div className="landing-section-shell landing-band-grid">
            <p className="landing-band-index">A01 / THE IDEA</p>
            <p className="landing-band-statement">Less noise around the work.<br /><strong>More clarity in the next step.</strong></p>
            <p className="landing-band-copy">From a first training video to a completed task, the platform keeps your path understandable and your workspace easy to return to.</p>
          </div>
        </section>

        <section id="how-it-works" className="landing-section-shell landing-section landing-workflow">
          <div className="landing-section-heading">
            <p className="landing-kicker"><span /> The member path</p>
            <h2>A considered start,<br /><em>step by step.</em></h2>
            <p>AdPulseAI is organized around a simple sequence. Learn the workflow, choose the access that fits, then work through what is available.</p>
          </div>
          <div className="landing-steps">
            <article><span className="landing-step-number">01</span><Mark>◎</Mark><h3>Register</h3><p>Create an account with the existing sign-up flow. If you were invited, your referral link can prefill the code.</p><Link to="/login?mode=register">Open registration <span>→</span></Link></article>
            <article><span className="landing-step-number">02</span><Mark>◌</Mark><h3>Complete training</h3><p>Begin with Video Reviewing Mastery, the focused training course that introduces the task workflow.</p><Link to="/login">Sign in to continue <span>→</span></Link></article>
            <article><span className="landing-step-number">03</span><Mark>◈</Mark><h3>Work your plan</h3><p>Use the member workspace to view plans, available tasks, payment history, and invite activity in one place.</p><Link to="/login">View the workspace <span>→</span></Link></article>
          </div>
        </section>

        <section className="landing-section-shell landing-section landing-proof">
          <div className="landing-proof-image"><div className="landing-proof-quote">“<br /><span>The next action should<br />always be clear.</span></div><div className="landing-proof-rule" /></div>
          <div className="landing-proof-copy"><p className="landing-kicker"><span /> Inside the platform</p><h2>One workspace.<br /><em>Four useful views.</em></h2><div className="landing-proof-list"><div><b>Tasks</b><span>Review what is available and open the next task.</span></div><div><b>Training</b><span>Complete the learning path before moving forward.</span></div><div><b>Payments</b><span>Keep plan and wallet activity together with history.</span></div><div><b>Invite</b><span>Share your link and follow your referral activity.</span></div></div></div>
        </section>

        <section id="plans" className="landing-section-shell landing-section landing-plans">
          <div className="landing-section-heading landing-plans-heading"><p className="landing-kicker"><span /> Access, plainly stated</p><h2>Choose your<br /><em>place to begin.</em></h2><p>Plans currently available in the application. Details shown here reflect the existing catalog.</p></div>
          <div className="landing-plan-table" role="table" aria-label="AdPulseAI plans">
            <div className="landing-plan-row landing-plan-head" role="row"><span>Plan</span><span>Price</span><span>Access window</span><span>Task allowance</span></div>
            {plans.map((plan) => <div className="landing-plan-row" role="row" key={plan.name}><strong>{plan.name}</strong><b>{plan.price}</b><span>{plan.detail}</span><span>{plan.tasks}</span></div>)}
          </div>
          <div className="landing-plan-note"><Mark>i</Mark><span>Plan purchase and upgrades happen inside the authenticated workspace. No payment details are collected on this public page.</span><Link to="/login">View plans after sign in <span>→</span></Link></div>
        </section>

        <section id="faq" className="landing-section-shell landing-section landing-faq">
          <div className="landing-section-heading"><p className="landing-kicker"><span /> Questions, answered</p><h2>Start with what<br /><em>you need to know.</em></h2></div>
          <div className="landing-faq-list"><details open><summary>What is AdPulseAI?</summary><p>AdPulseAI is a member workspace for digital promotion tasks, training, plans, payments, and invite activity.</p></details><details><summary>Do I need to train before using the workspace?</summary><p>New members are guided through the existing Video Reviewing Mastery training flow before accessing the next stages of the application.</p></details><details><summary>Can I share an invite link?</summary><p>Yes. The authenticated Invite area provides a referral code and link when available, along with activity and commission history.</p></details><details><summary>How do I access my account?</summary><p>Use the existing login flow. Returning members can sign in directly, while new members can open registration from the button above.</p></details></div>
        </section>

        <section className="landing-final-cta"><div className="landing-section-shell landing-final-inner"><p className="landing-kicker"><span /> Your next step</p><h2>Begin with a<br /><em>clearer view.</em></h2><p>Open the existing AdPulseAI workspace and take the next step at your own pace.</p><Link className="landing-button landing-button-light" to="/login?mode=register">Create your account <span aria-hidden="true">↗</span></Link></div></section>
      </main>

      <footer className="landing-footer"><div className="landing-section-shell landing-footer-inner"><Link className="landing-wordmark" to="/" aria-label="AdPulseAI home"><img src="/assets/logo.png" alt="" /><span>AdPulse<span>AI</span></span></Link><p>Digital promotion tasks, training, and workspace clarity.</p><div><a href="#faq">FAQ</a></div><small>© {new Date().getFullYear()} AdPulseAI. All rights reserved.</small></div></footer>
    </div>
  )
}
