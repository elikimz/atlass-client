import { useState } from 'react'
import DemoIcon from './DemoIcon'
import type { ActivityItem, DemoPanel, DemoTask, HistoryItem, InviteRow, PlanFixture } from './demoData'
import { formatCurrency, PLANS } from './demoData'

const historyKindLabels: Record<HistoryItem['kind'], string> = {
  deposit: 'Deposit',
  payout: 'Payout',
  earning: 'Earning',
  refund: 'Refund',
  plan: 'Plan',
}

interface DashboardPanelProps {
  deposit: number
  withdrawal: number
  totalEarnings: number
  releasedRefund: number
  taskEarnings: number
  inviteCommission: number
  rebate: number
  isTrained: boolean
  activePlan: PlanFixture
  doneTasksToday: number
  pendingTasks: number
  activities: ActivityItem[]
  onNavigate: (panel: DemoPanel) => void
}

export function DashboardPanel({ deposit, withdrawal, totalEarnings, releasedRefund, taskEarnings, inviteCommission, rebate, isTrained, activePlan, doneTasksToday, pendingTasks, activities, onNavigate }: DashboardPanelProps) {
  const chartSeed = [0.8, 1.2, 0.6, 1.4, 1, 1.6]
  const chartSeedTotal = chartSeed.reduce((sum, value) => sum + value, 0)
  const chartValues = taskEarnings >= chartSeedTotal
    ? [...chartSeed, taskEarnings - chartSeedTotal]
    : chartSeed.map((value) => taskEarnings > 0 ? (value / chartSeedTotal) * taskEarnings : 0)
  const chartMax = Math.max(1, Math.ceil(Math.max(...chartValues)))
  const chartMidpoint = chartMax / 2
  const walletCards = [
    { label: 'Deposit wallet', value: deposit, note: 'Recharged funds only', icon: 'wallet' as const },
    { label: 'Withdrawal wallet', value: withdrawal, note: 'Cashable earnings', icon: 'chart' as const },
    { label: 'Total earnings', value: totalEarnings, note: 'Excludes recharges', icon: 'spark' as const },
    { label: 'Released refund', value: releasedRefund, note: releasedRefund > 0 ? 'From plan upgrade' : 'No released refund', icon: 'lock' as const },
  ]

  return (
    <div className="demo-panel-content">
      <div className="demo-panel-intro">
        <div>
          <p className="demo-kicker">MEMBER OVERVIEW</p>
          <h2 id="demo-panel-heading">A focused place to work.</h2>
          <p>Here is a small, representative account view. Follow the next action without guessing what each balance means.</p>
        </div>
        <span className="demo-plan-chip"><span className="demo-status-dot" /> {activePlan.name} plan</span>
      </div>

      <div className="demo-wallet-grid" aria-label="Wallet balances">
        {walletCards.map((card) => (
          <article className="demo-metric-card" key={card.label}>
            <div className="demo-metric-icon"><DemoIcon name={card.icon} size={17} /></div>
            <p>{card.label}</p>
            <strong>{formatCurrency(card.value)}</strong>
            <span>{card.note}</span>
          </article>
        ))}
      </div>

      <div className="demo-dashboard-grid">
        <article className="demo-card demo-chart-card">
          <div className="demo-card-heading">
            <div>
              <h3>Earnings overview</h3>
              <p>Task earnings · seven-day sample</p>
            </div>
            <span className="demo-card-tag">{formatCurrency(taskEarnings)} total</span>
          </div>
          <div className="demo-chart" role="img" aria-label={`Seven day task earnings chart totaling ${formatCurrency(taskEarnings)}`}>
            <div className="demo-chart-y-axis"><span>{formatCurrency(chartMax)}</span><span>{formatCurrency(chartMidpoint)}</span><span>$0</span></div>
            <div className="demo-chart-plot">
              <div className="demo-chart-gridline demo-chart-gridline-top" />
              <div className="demo-chart-gridline demo-chart-gridline-middle" />
              <div className="demo-chart-gridline demo-chart-gridline-bottom" />
              <div className="demo-chart-bars">
                {chartValues.map((value, index) => <span className="demo-chart-bar-wrap" key={`${value}-${index}`}><span className="demo-chart-bar" style={{ height: `${Math.max(8, (value / chartMax) * 100)}%` }} /></span>)}
              </div>
            </div>
            <div className="demo-chart-labels" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          </div>
        </article>

        <article className="demo-card demo-queue-card">
          <div className="demo-card-heading"><div><h3>Today at a glance</h3><p>{activePlan.name} plan · {activePlan.dailyCap} task cap</p></div><DemoIcon name="tasks" size={19} /></div>
          <div className="demo-queue-count"><strong>{pendingTasks}</strong><span>sample tasks<br />left in queue</span></div>
          <div className="demo-progress-line"><span style={{ width: `${Math.min(100, (doneTasksToday / Math.max(activePlan.dailyCap, 1)) * 100)}%` }} /></div>
          <p className="demo-progress-copy">{doneTasksToday} of {activePlan.dailyCap} daily slots used</p>
          <button className="demo-button demo-button-primary demo-button-wide" type="button" onClick={() => onNavigate(pendingTasks > 0 ? 'tasks' : 'plans')}>
            {pendingTasks > 0 ? 'Open task queue' : 'Review plans'} <DemoIcon name="arrow-right" size={16} />
          </button>
        </article>
      </div>

      <div className="demo-dashboard-lower">
        <article className="demo-card demo-activity-card">
          <div className="demo-card-heading"><div><h3>Recent activity</h3><p>Illustrative ledger entries</p></div><button className="demo-text-button" type="button" onClick={() => onNavigate('wallet')}>View wallet <DemoIcon name="arrow-right" size={14} /></button></div>
          <div className="demo-activity-list">
            {activities.slice(0, 4).map((activity) => <div className="demo-activity-row" key={activity.id}><span className={`demo-activity-icon demo-activity-${activity.tone}`}><DemoIcon name={activity.tone === 'positive' ? 'check' : activity.tone === 'pending' ? 'clock' : 'layers'} size={14} /></span><span>{activity.label}</span><strong>{activity.amount}</strong></div>)}
          </div>
        </article>
        <article className="demo-card demo-training-prompt">
          <span className="demo-prompt-label"><DemoIcon name="training" size={15} /> NEXT UP</span>
          <h3>{isTrained ? 'Keep your workflow moving.' : 'Complete your orientation.'}</h3>
          <p>{isTrained ? 'Your training preview is complete. Continue with the available task queue.' : 'Preview Video Reviewing Mastery, then explore the plans and task queue.'}</p>
          <button className="demo-button demo-button-secondary" type="button" onClick={() => onNavigate(isTrained ? 'tasks' : 'training')}>
            {isTrained ? 'View tasks' : 'View training'} <DemoIcon name="arrow-right" size={15} />
          </button>
        </article>
      </div>

      <div className="demo-breakdown-strip" aria-label="Earnings breakdown">
        <span>Task earnings <strong>{formatCurrency(taskEarnings)}</strong></span><span>Invite commission <strong>{formatCurrency(inviteCommission)}</strong></span><span>Rebates <strong>{formatCurrency(rebate)}</strong></span><span>Released refund <strong>{formatCurrency(releasedRefund)}</strong></span>
      </div>
    </div>
  )
}

interface TrainingPanelProps {
  isTrained: boolean
  isWatching: boolean
  videoWatched: boolean
  videoError: boolean
  onStart: () => void
  onBack: () => void
  onVideoEnded: () => void
  onVideoError: () => void
  onFinish: () => void
  onShortcut: () => void
}

export function TrainingPanel({ isTrained, isWatching, videoWatched, videoError, onStart, onBack, onVideoEnded, onVideoError, onFinish, onShortcut }: TrainingPanelProps) {
  if (isWatching) {
    return (
      <div className="demo-panel-content demo-training-player">
        <button className="demo-back-button" type="button" onClick={onBack}><DemoIcon name="arrow-right" size={15} /> Back to training</button>
        <div className="demo-player-heading"><div><p className="demo-kicker">VIDEO TRAINING</p><h2 id="demo-panel-heading">Video Reviewing Mastery</h2><p>Watch the API's seeded sample clip to enable this preview's completion step.</p></div><span className="demo-duration"><DemoIcon name="clock" size={14} /> Short sample</span></div>
        <div className="demo-video-frame demo-training-video">
          {videoError ? <div className="demo-video-fallback"><DemoIcon name="video" size={28} /><strong>Sample video unavailable</strong><p>The preview could not load in this browser. You can still inspect the next step with the demo shortcut below.</p><button className="demo-button demo-button-secondary" type="button" onClick={onShortcut}>Preview completed training</button></div> : <video controls playsInline autoPlay onEnded={onVideoEnded} onError={onVideoError} aria-label="Video Reviewing Mastery sample"><source src="/assets/demo-review.mp4" type="video/mp4" />Your browser does not support the video element.</video>}
        </div>
        <div className="demo-player-meta"><span>API seed clip · live training media may vary</span><span className={videoWatched ? 'demo-ready' : ''}>{videoWatched ? 'Watched · ready to finish' : 'Finish watching to continue'}</span></div>
        <div className="demo-action-row"><button className="demo-button demo-button-primary" type="button" disabled={!videoWatched} onClick={onFinish}>{videoWatched ? 'Finish training' : 'Watch the sample first'} <DemoIcon name="arrow-right" size={15} /></button><button className="demo-button demo-button-quiet" type="button" onClick={onShortcut}>Demo shortcut: preview completed training</button></div>
      </div>
    )
  }

  return (
    <div className="demo-panel-content">
      <div className="demo-panel-intro"><div><p className="demo-kicker">TRAINING CENTER</p><h2 id="demo-panel-heading">Learn the path before you take it.</h2><p>Video Reviewing Mastery is the real app's starting point for understanding the task workflow.</p></div><span className={`demo-status-pill ${isTrained ? 'demo-status-done' : ''}`}><span className="demo-status-dot" /> {isTrained ? 'Preview complete' : 'Not started'}</span></div>
      <article className="demo-card demo-course-card">
        <div className="demo-course-icon"><DemoIcon name="video" size={25} /></div>
        <div className="demo-course-copy"><p className="demo-eyebrow">COURSE 01</p><h3>Video Reviewing Mastery</h3><p>Explore a video step from the real workflow. The clip shown here comes from the API's seeded sample data.</p><div className="demo-course-meta"><span><DemoIcon name="clock" size={14} /> Short sample</span><span><DemoIcon name="check" size={14} /> One video</span></div></div>
        <div className="demo-course-action">{isTrained ? <button className="demo-button demo-button-secondary" type="button" onClick={onStart}>Replay sample <DemoIcon name="play" size={14} /></button> : <button className="demo-button demo-button-primary" type="button" onClick={onStart}>Start training <DemoIcon name="arrow-right" size={15} /></button>}</div>
      </article>
      <div className="demo-callout"><DemoIcon name="shield" size={17} /><div><strong>Module note</strong><p>This preview shows the training step; finishing it does not create a certification record.</p></div></div>
    </div>
  )
}

interface PlansPanelProps {
  activePlan: PlanFixture
  deposit: number
  message: string
  onUpgrade: (plan: PlanFixture) => void
}

export function PlansPanel({ activePlan, deposit, message, onUpgrade }: PlansPanelProps) {
  const visiblePlans = PLANS.slice(0, 3)
  return (
    <div className="demo-panel-content">
      <div className="demo-panel-intro"><div><p className="demo-kicker">PLAN ACCESS</p><h2 id="demo-panel-heading">Choose the next level of access.</h2><p>Compare sample access plans. Your account shows current terms and task availability.</p></div><div className="demo-balance-note"><span>Deposit available</span><strong>{formatCurrency(deposit)}</strong></div></div>
      {message && <div className={`demo-feedback ${message.startsWith('Upgrade') ? 'demo-feedback-success' : 'demo-feedback-error'}`} role="status"><DemoIcon name={message.startsWith('Upgrade') ? 'check' : 'clock'} size={16} /> {message}</div>}
      <div className="demo-plan-grid">
        {visiblePlans.map((plan) => {
          const isActive = activePlan.name === plan.name
          const isHigher = plan.price > activePlan.price
          const insufficient = isHigher && deposit < plan.price
          return <article className={`demo-plan-card ${isActive ? 'demo-plan-active' : ''}`} key={plan.name}>
            <div className="demo-plan-topline"><span>{plan.name}</span>{isActive && <em>Current</em>}</div>
            <div className="demo-plan-price">{plan.price === 0 ? 'Free' : formatCurrency(plan.price)}<small>{plan.price === 0 ? 'trial access' : 'full plan price'}</small></div>
            <dl className="demo-plan-details"><div><dt>Validity</dt><dd>{plan.validityDays} days</dd></div><div><dt>Daily task cap</dt><dd>{plan.dailyCap}</dd></div></dl>
            <button className={`demo-button ${isActive ? 'demo-button-disabled' : 'demo-button-secondary'} demo-button-wide`} type="button" disabled={isActive || !isHigher} onClick={() => onUpgrade(plan)}>{isActive ? 'Current plan' : insufficient ? `Need ${formatCurrency(plan.price)}` : `Upgrade to ${plan.name}`} {!isActive && isHigher && <DemoIcon name="arrow-right" size={14} />}</button>
            {!isActive && isHigher && <p className="demo-plan-footnote">Full {formatCurrency(plan.price)} is deducted from Deposit Wallet. The previous plan price is released to Withdrawal Wallet on upgrade.</p>}
          </article>
        })}
      </div>
      <div className="demo-plan-note"><DemoIcon name="layers" size={16} /><span><strong>More plans in your member account:</strong> LV3, LV4, and LV5 are additional options; exact terms appear when signed in.</span></div>
      <div className="demo-callout"><DemoIcon name="wallet" size={17} /><div><strong>How upgrades are represented here</strong><p>There is no real recharge or payment. An upgrade uses the full sample price, then credits the old plan price as a released refund in this local preview.</p></div></div>
    </div>
  )
}

interface TasksPanelProps {
  tasks: DemoTask[]
  completedTaskIds: string[]
  activeTask: DemoTask | null
  planMessage: string
  videoWatched: boolean
  secondsRemaining: number
  videoError: boolean
  dailyCap: number
  doneTasksToday: number
  onStart: (task: DemoTask) => void
  onExit: () => void
  onDashboard: () => void
  onVideoEnded: () => void
  onVideoError: () => void
  onSkipPlayback: () => void
  onComplete: () => void
}

export function TasksPanel({ tasks, completedTaskIds, activeTask, planMessage, videoWatched, secondsRemaining, videoError, dailyCap, doneTasksToday, onStart, onExit, onDashboard, onVideoEnded, onVideoError, onSkipPlayback, onComplete }: TasksPanelProps) {
  if (activeTask) {
    const ready = videoWatched && secondsRemaining === 0
    return <div className="demo-panel-content demo-task-player"><button className="demo-back-button" type="button" onClick={onExit}><DemoIcon name="arrow-right" size={15} /> Back to tasks</button><div className="demo-player-heading"><div><p className="demo-kicker">TASK PLAYER · ILLUSTRATIVE REWARD</p><h2 id="demo-panel-heading">{activeTask.title}</h2><p>{activeTask.description}</p></div><span className="demo-reward-value">+{formatCurrency(activeTask.reward)}</span></div><div className="demo-video-frame demo-task-video">{videoError ? <div className="demo-video-fallback"><DemoIcon name="video" size={28} /><strong>Sample video unavailable</strong><p>The sample asset could not load. Use the demo-only shortcut to mark the watch step complete.</p><button className="demo-button demo-button-secondary" type="button" onClick={onSkipPlayback}>Skip playback in demo</button></div> : <video controls playsInline autoPlay onEnded={onVideoEnded} onError={onVideoError} aria-label={`${activeTask.title} sample video`}><source src={activeTask.videoUrl} type="video/mp4" />Your browser does not support the video element.</video>}</div><div className="demo-player-meta"><span>Reward is illustrative · no real transaction</span><span className={ready ? 'demo-ready' : ''}>{ready ? 'Ready to submit' : videoWatched ? `Wait ${secondsRemaining}s to submit` : `Watch video · ${secondsRemaining}s timer`}</span></div><div className="demo-task-progress"><div><span>Watch step</span><strong>{videoWatched ? 'Complete' : 'Required'}</strong></div><div className="demo-progress-line"><span style={{ width: `${videoWatched ? 100 : 24}%` }} /></div><div><span>Wait timer</span><strong>{secondsRemaining === 0 ? 'Complete' : `${secondsRemaining}s left`}</strong></div><progress value={20 - secondsRemaining} max={20} aria-label={`${20 - secondsRemaining} of 20 seconds elapsed`} /></div><div className="demo-inline-note"><DemoIcon name="clock" size={16} /><span>The real player waits 20 seconds and requires the video to finish before submission.</span></div><div className="demo-action-row"><button className="demo-button demo-button-primary" type="button" disabled={!ready} onClick={onComplete}>{ready ? 'Complete task & add reward' : secondsRemaining > 0 ? `Wait ${secondsRemaining}s to finish` : 'Finish watching the video'} <DemoIcon name="arrow-right" size={15} /></button><button className="demo-button demo-button-quiet" type="button" onClick={onSkipPlayback}>Skip playback in demo</button></div></div>
  }

  const completedCount = completedTaskIds.length
  const remaining = tasks.filter((task) => !completedTaskIds.includes(task.id))
  const dailyCapReached = doneTasksToday >= dailyCap
  return <div className="demo-panel-content"><div className="demo-panel-intro"><div><p className="demo-kicker">MY TASKS</p><h2 id="demo-panel-heading">A queue with a clear finish line.</h2><p>Start a sample video task, let the timer run while the player is active, then submit once.</p></div><div className="demo-balance-note"><span>Today</span><strong>{doneTasksToday} / {dailyCap}</strong><small>daily slots used</small></div></div>{planMessage && <div className="demo-feedback demo-feedback-success" role="status"><DemoIcon name="check" size={16} /> {planMessage}</div>}<div className="demo-task-summary"><span><strong>{remaining.length}</strong> available samples</span><span><strong>{completedCount}</strong> completed in this preview</span><span><DemoIcon name="clock" size={14} /> 20s player wait</span></div>{remaining.length === 0 ? <div className="demo-empty-state"><span className="demo-empty-icon"><DemoIcon name="check" size={22} /></span><h3>No sample tasks remain.</h3><p>You completed both illustrative tasks in this local preview. The dashboard and wallet totals are updated.</p><button className="demo-button demo-button-secondary" type="button" onClick={onDashboard}>Back to dashboard <DemoIcon name="arrow-right" size={15} /></button></div> : <div className="demo-task-list">{tasks.map((task) => { const completed = completedTaskIds.includes(task.id); return <article className={`demo-task-row ${completed ? 'demo-task-complete' : ''}`} key={task.id}><div className="demo-task-icon"><DemoIcon name={completed ? 'check' : 'play'} size={17} /></div><div className="demo-task-copy"><h3>{task.title}</h3><p>{task.description}</p></div><div className="demo-task-action"><strong>+{formatCurrency(task.reward)}</strong>{completed ? <span className="demo-done-label"><DemoIcon name="check" size={13} /> Done</span> : <button className="demo-button demo-button-secondary" type="button" disabled={dailyCapReached} onClick={() => onStart(task)}>{dailyCapReached ? 'Daily cap reached' : 'Start task'} <DemoIcon name="arrow-right" size={14} /></button>}</div></article> })}</div>}<div className="demo-callout"><DemoIcon name="shield" size={17} /><div><strong>How the sample works</strong><p>Availability, daily limits, and rewards depend on your current plan. Watch the task video, then submit when the timer is complete.</p></div></div></div>
}

interface WalletPanelProps {
  deposit: number
  withdrawal: number
  totalEarnings: number
  taskEarnings: number
  inviteCommission: number
  rebate: number
  releasedRefund: number
  history: HistoryItem[]
}

export function WalletPanel({ deposit, withdrawal, totalEarnings, taskEarnings, inviteCommission, rebate, releasedRefund, history }: WalletPanelProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'payout'>('all')
  const [showPayoutSteps, setShowPayoutSteps] = useState(false)
  const filteredHistory = history.filter((item) => filter === 'all' || item.kind === filter)
  return <div className="demo-panel-content"><div className="demo-panel-intro"><div><p className="demo-kicker">PAYMENTS / WALLET</p><h2 id="demo-panel-heading">See the money trail, not a mystery.</h2><p>Deposit and withdrawal balances stay separate, with the earned breakdown visible beside the sample history.</p></div><span className="demo-status-pill"><DemoIcon name="shield" size={14} /> Local-only preview</span></div><div className="demo-wallet-feature-grid"><article className="demo-feature-balance"><span>Deposit wallet</span><strong>{formatCurrency(deposit)}</strong><p>Recharged funds only</p></article><article className="demo-feature-balance demo-feature-earnings"><span>Withdrawal wallet</span><strong>{formatCurrency(withdrawal)}</strong><p>Cashable earnings</p></article><article className="demo-feature-balance"><span>Total earnings</span><strong>{formatCurrency(totalEarnings)}</strong><p>Excludes recharges</p></article></div><div className="demo-wallet-grid demo-wallet-breakdown"><article className="demo-card demo-earnings-breakdown"><div className="demo-card-heading"><div><h3>Earned breakdown</h3><p>Totals reconcile to Total earnings</p></div><DemoIcon name="chart" size={18} /></div><div className="demo-breakdown-list"><div><span>Task earnings</span><strong>{formatCurrency(taskEarnings)}</strong></div><div><span>Invite commission</span><strong>{formatCurrency(inviteCommission)}</strong></div><div><span>Task rebates</span><strong>{formatCurrency(rebate)}</strong></div><div><span>Released upgrade refund</span><strong>{formatCurrency(releasedRefund)}</strong></div></div></article><article className="demo-card demo-recharge-card"><span className="demo-prompt-label"><DemoIcon name="wallet" size={15} /> PLAN ACCESS</span><h3>Recharges fund plan access, not earnings.</h3><p>This preview never asks for payment details. In the member account, a recharge funds the Deposit Wallet; it is not counted as income.</p><span className="demo-static-action">Recharge explanation only</span></article></div><div className="demo-wallet-actions"><button className="demo-button demo-button-primary" type="button" onClick={() => setShowPayoutSteps((value) => !value)}>{showPayoutSteps ? 'Hide payout steps' : 'Preview payout steps'} <DemoIcon name={showPayoutSteps ? 'minus' : 'plus'} size={15} /></button><span>Nothing is submitted from this demo.</span></div>{showPayoutSteps && <div className="demo-payout-preview" role="status"><div><span className="demo-step-index">01</span><p><strong>Destination</strong><br />A saved withdrawal destination would be selected.</p></div><div><span className="demo-step-index">02</span><p><strong>Amount</strong><br />The amount is checked against the Withdrawal Wallet.</p></div><div><span className="demo-step-index">03</span><p><strong>Review</strong><br />A withdrawal password and admin review are required. No sensitive details are collected here.</p></div></div>}<article className="demo-card demo-history-card"><div className="demo-card-heading"><div><h3>Sample transaction history</h3><p>Fixture rows with illustrative statuses</p></div><DemoIcon name="filter" size={17} /></div><div className="demo-filter-row" role="group" aria-label="Filter sample transactions">{(['all', 'deposit', 'payout'] as const).map((option) => <button key={option} className={filter === option ? 'is-active' : ''} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option}>{option === 'all' ? 'All' : option === 'deposit' ? 'Deposits' : 'Payouts'}</button>)}</div><div className="demo-history-list">{filteredHistory.length === 0 ? <div className="demo-empty-state"><h3>No {filter === 'all' ? 'transaction' : filter === 'deposit' ? 'deposit' : 'payout'} entries.</h3><p>No sample ledger entries match this filter.</p></div> : filteredHistory.map((item) => <div className="demo-history-row" key={item.id}><div><span className={`demo-history-kind demo-history-${item.kind}`}>{historyKindLabels[item.kind]}</span><strong>{item.label}</strong></div><div><strong>{item.amount}</strong><span className={`demo-history-status demo-history-status-${item.status}`}>{item.status}</span></div></div>)}</div></article></div>
}

interface InvitesPanelProps {
  invites: InviteRow[]
  copied: 'code' | 'link' | 'fallback' | null
  onCopy: (value: string, target: 'code' | 'link') => void
}

export function InvitesPanel({ invites, copied, onCopy }: InvitesPanelProps) {
  const sampleLink = 'https://example.com/?ref=ADP-DEMO'
  return <div className="demo-panel-content"><div className="demo-panel-intro"><div><p className="demo-kicker">INVITE ACTIVITY</p><h2 id="demo-panel-heading">Keep the network understandable.</h2><p>Use this read-only preview to see the referral surface. ADP-DEMO is a placeholder code; this preview does not send invites.</p></div><span className="demo-status-pill"><DemoIcon name="user-plus" size={14} /> Preview only</span></div><div className="demo-invite-code-grid"><div className="demo-copy-field"><label htmlFor="demo-invite-code">Sample invite code</label><div><input id="demo-invite-code" value="ADP-DEMO" readOnly /><button className="demo-button demo-button-secondary" type="button" onClick={() => onCopy('ADP-DEMO', 'code')}><DemoIcon name="copy" size={14} /> {copied === 'code' ? 'Copied' : 'Copy code'}</button></div></div><div className="demo-copy-field"><label htmlFor="demo-invite-link">Read-only preview link</label><div><input id="demo-invite-link" value={sampleLink} readOnly /><button className="demo-button demo-button-secondary" type="button" onClick={() => onCopy(sampleLink, 'link')}><DemoIcon name="copy" size={14} /> {copied === 'link' ? 'Copied' : 'Copy link'}</button></div></div></div>{copied === 'fallback' && <p className="demo-copy-fallback" role="status">Copy is unavailable in this browser. The value remains visible for manual selection.</p>}<div className="demo-tier-grid"><article><span className="demo-tier-rate">10%</span><h3>Tier A</h3><p>Direct referral cap</p></article><article><span className="demo-tier-rate">4%</span><h3>Tier B</h3><p>Second-level cap</p></article><article><span className="demo-tier-rate">1%</span><h3>Tier C</h3><p>Third-level cap</p></article></div><p className="demo-tier-note">Membership eligibility and rates are configurable. These are caps, not guaranteed earnings or automatic commission triggers.</p><article className="demo-card demo-invite-list-card"><div className="demo-card-heading"><div><h3>Sample invite rows</h3><p>Existing fixture commission: {formatCurrency(4)}</p></div><DemoIcon name="user-plus" size={17} /></div><div className="demo-invite-list">{invites.map((invite) => <div className="demo-invite-row" key={invite.name}><span className="demo-avatar">{invite.name.slice(-1)}</span><div><strong>{invite.name}</strong><span>Tier {invite.tier}</span></div><span className={`demo-invite-status demo-invite-status-${invite.status.toLowerCase()}`}>{invite.status}</span></div>)}</div></article><div className="demo-callout"><DemoIcon name="shield" size={17} /><div><strong>Preview only</strong><p>ADP-DEMO is not a valid code; copying stays in this browser.</p></div></div></div>
}
