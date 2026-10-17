import { useEffect, useRef, useState } from 'react'
import DemoIcon from './DemoIcon'
import { DashboardPanel, InvitesPanel, PlansPanel, TasksPanel, TrainingPanel, WalletPanel } from './DemoPanels'
import type { DemoIconName } from './DemoIcon'
import type { ActivityItem, DemoPanel, DemoTask, HistoryItem, PlanFixture, TourPanel } from './demoData'
import { DEMO_TASKS, INITIAL_ACTIVITIES, INITIAL_HISTORY, INITIAL_INVITES, PLANS, TOUR_STEPS, formatCurrency } from './demoData'
import './ProductDemo.css'

const navItems: Array<{ label: string; panel: DemoPanel; icon: DemoIconName }> = [
  { label: 'Dashboard', panel: 'dashboard', icon: 'grid' },
  { label: 'My Tasks', panel: 'tasks', icon: 'tasks' },
  { label: 'Plans', panel: 'plans', icon: 'layers' },
  { label: 'Invite', panel: 'invites', icon: 'user-plus' },
  { label: 'Training', panel: 'training', icon: 'training' },
  { label: 'Payments', panel: 'wallet', icon: 'wallet' },
]

const panelMeta: Record<DemoPanel, { label: string; description: string }> = {
  dashboard: { label: 'Dashboard', description: 'Your workspace overview' },
  training: { label: 'Training', description: 'Learn the workflow' },
  plans: { label: 'Plans', description: 'Choose member access' },
  tasks: { label: 'My Tasks', description: 'Work the task queue' },
  wallet: { label: 'Payments', description: 'Follow the ledger' },
  invites: { label: 'Invite', description: 'Referral activity' },
}

const initialPlan = PLANS[0]

export default function ProductDemo() {
  const [panel, setPanel] = useState<DemoPanel>('dashboard')
  const [tourPanel, setTourPanel] = useState<TourPanel>('training')
  const [isTrained, setIsTrained] = useState(false)
  const [isWatchingTraining, setIsWatchingTraining] = useState(false)
  const [trainingVideoWatched, setTrainingVideoWatched] = useState(false)
  const [trainingVideoError, setTrainingVideoError] = useState(false)
  const [activePlan, setActivePlan] = useState<PlanFixture>(initialPlan)
  const [planMessage, setPlanMessage] = useState('')
  const [deposit, setDeposit] = useState(80)
  const [withdrawal, setWithdrawal] = useState(12.4)
  const [taskEarnings, setTaskEarnings] = useState(8.4)
  const [inviteCommission] = useState(4)
  const [rebate] = useState(0)
  const [releasedRefund, setReleasedRefund] = useState(0)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [doneTasksToday, setDoneTasksToday] = useState(0)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [taskVideoWatched, setTaskVideoWatched] = useState(false)
  const [taskSecondsRemaining, setTaskSecondsRemaining] = useState(20)
  const [taskVideoError, setTaskVideoError] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY)
  const [copied, setCopied] = useState<'code' | 'link' | 'fallback' | null>(null)
  const [announcement, setAnnouncement] = useState('Demo ready. Sample data only.')
  const copyResetTimerRef = useRef<number | null>(null)
  const completedTaskIdsRef = useRef<Set<string>>(new Set())

  const totalEarnings = taskEarnings + inviteCommission + rebate + releasedRefund
  const activeTask = DEMO_TASKS.find((task) => task.id === activeTaskId) ?? null
  const pendingTasks = DEMO_TASKS.filter((task) => !completedTaskIds.includes(task.id)).length
  const currentTour = TOUR_STEPS.find((step) => step.panel === tourPanel) ?? TOUR_STEPS[0]
  const tourIndex = TOUR_STEPS.findIndex((step) => step.panel === tourPanel)
  const activeTourPanel = panel === 'dashboard' ? tourPanel : panel

  useEffect(() => {
    if (panel !== 'tasks' || activeTaskId === null || taskSecondsRemaining <= 0) return undefined
    const timerId = window.setTimeout(() => {
      setTaskSecondsRemaining((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearTimeout(timerId)
  }, [panel, activeTaskId, taskSecondsRemaining])

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) window.clearTimeout(copyResetTimerRef.current)
    }
  }, [])

  const resetTaskPlayer = () => {
    setActiveTaskId(null)
    setTaskVideoWatched(false)
    setTaskSecondsRemaining(20)
    setTaskVideoError(false)
  }

  const clearCopyResetTimer = () => {
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current)
      copyResetTimerRef.current = null
    }
  }

  const goToPanel = (nextPanel: DemoPanel) => {
    if (nextPanel !== 'tasks') resetTaskPlayer()
    if (nextPanel !== 'training') {
      setIsWatchingTraining(false)
      setTrainingVideoWatched(false)
      setTrainingVideoError(false)
    }
    setPanel(nextPanel)
    setTourPanel(nextPanel === 'dashboard' ? 'training' : nextPanel)
    setAnnouncement(`${panelMeta[nextPanel].label} panel selected.`)
  }

  const resetDemo = () => {
    setPanel('dashboard')
    setTourPanel('training')
    setIsTrained(false)
    setIsWatchingTraining(false)
    setTrainingVideoWatched(false)
    setTrainingVideoError(false)
    setActivePlan(initialPlan)
    setPlanMessage('')
    setDeposit(80)
    setWithdrawal(12.4)
    setTaskEarnings(8.4)
    setReleasedRefund(0)
    setCompletedTaskIds([])
    setDoneTasksToday(0)
    resetTaskPlayer()
    setActivities(INITIAL_ACTIVITIES)
    setHistory(INITIAL_HISTORY)
    setCopied(null)
    clearCopyResetTimer()
    completedTaskIdsRef.current.clear()
    setAnnouncement('Demo reset. Sample data restored.')
  }

  const startTraining = () => {
    setPanel('training')
    setTourPanel('training')
    setIsWatchingTraining(true)
    setTrainingVideoWatched(false)
    setTrainingVideoError(false)
    setAnnouncement('Training sample opened.')
  }

  const completeTraining = () => {
    if (!trainingVideoWatched) return
    setIsTrained(true)
    setIsWatchingTraining(false)
    setTrainingVideoWatched(false)
    setPanel('plans')
    setTourPanel('plans')
    setAnnouncement('Training preview complete. Plans opened next.')
  }

  const previewCompletedTraining = () => {
    setIsTrained(true)
    setIsWatchingTraining(false)
    setTrainingVideoWatched(false)
    setTrainingVideoError(false)
    setPanel('plans')
    setTourPanel('plans')
    setAnnouncement('Demo shortcut used. This preview does not claim actual certification.')
  }

  const startTask = (task: DemoTask) => {
    if (activeTaskId !== null || completedTaskIds.includes(task.id) || completedTaskIdsRef.current.has(task.id)) return
    if (doneTasksToday >= activePlan.dailyCap) {
      setAnnouncement(`Daily sample limit reached for the ${activePlan.name} plan.`)
      return
    }
    setPanel('tasks')
    setTourPanel('tasks')
    setActiveTaskId(task.id)
    setTaskVideoWatched(false)
    setTaskSecondsRemaining(20)
    setTaskVideoError(false)
    setAnnouncement(`${task.title} opened. Watch the video and wait 20 seconds.`)
  }

  const completeTask = () => {
    if (!activeTask || !taskVideoWatched || taskSecondsRemaining > 0 || completedTaskIds.includes(activeTask.id) || completedTaskIdsRef.current.has(activeTask.id) || doneTasksToday >= activePlan.dailyCap) return
    const reward = activeTask.reward
    completedTaskIdsRef.current.add(activeTask.id)
    setCompletedTaskIds((ids) => [...ids, activeTask.id])
    setDoneTasksToday((count) => count + 1)
    setTaskEarnings((value) => value + reward)
    setWithdrawal((value) => value + reward)
    setActivities((items) => [{ id: `activity-${activeTask.id}`, label: `${activeTask.title} completed`, amount: `+${formatCurrency(reward)}`, tone: 'positive' }, ...items])
    setHistory((items) => [{ id: `history-${activeTask.id}`, kind: 'earning', label: 'Illustrative task reward', amount: `+${formatCurrency(reward)}`, status: 'approved' }, ...items])
    setAnnouncement(`${activeTask.title} completed. ${formatCurrency(reward)} added to the sample Withdrawal Wallet.`)
    resetTaskPlayer()
  }

  const upgradePlan = (nextPlan: PlanFixture) => {
    if (nextPlan.price <= activePlan.price) return
    if (deposit < nextPlan.price) {
      setPlanMessage(`Insufficient Deposit Wallet. ${nextPlan.name} requires ${formatCurrency(nextPlan.price)}; ${formatCurrency(deposit)} is available.`)
      setAnnouncement('Upgrade not completed because the sample Deposit Wallet is too low.')
      return
    }
    const oldPrice = activePlan.price
    setDeposit((value) => value - nextPlan.price)
    setWithdrawal((value) => value + oldPrice)
    setReleasedRefund((value) => value + oldPrice)
    setActivePlan(nextPlan)
    setPlanMessage(`Upgrade preview: ${nextPlan.name} is active. ${formatCurrency(nextPlan.price)} used from sample Deposit Wallet.${oldPrice > 0 ? ` ${formatCurrency(oldPrice)} from ${activePlan.name} was released to sample Withdrawal Wallet.` : ''}`)
    setActivities((items) => [{ id: `activity-plan-${nextPlan.name}`, label: `${nextPlan.name} plan upgrade`, amount: `-${formatCurrency(nextPlan.price)}`, tone: 'neutral' }, ...items])
    setHistory((items) => [
      { id: `history-plan-${nextPlan.name}`, kind: 'plan', label: `${nextPlan.name} plan access`, amount: `-${formatCurrency(nextPlan.price)}`, status: 'approved' },
      ...(oldPrice > 0 ? [{ id: `history-refund-${nextPlan.name}`, kind: 'refund' as const, label: `${activePlan.name} plan refund released`, amount: `+${formatCurrency(oldPrice)}`, status: 'approved' as const }] : []),
      ...items,
    ])
    setAnnouncement(`Upgrade to ${nextPlan.name} complete. Tasks opened next.`)
    goToPanel('tasks')
  }

  const copyPreview = async (value: string, target: 'code' | 'link') => {
    clearCopyResetTimer()
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(value)
      setCopied(target)
      setAnnouncement(`${target === 'code' ? 'Sample code' : 'Preview link'} copied.`)
    } catch {
      setCopied('fallback')
      setAnnouncement('Copy is unavailable in this browser. Select the visible value manually.')
    }
    copyResetTimerRef.current = window.setTimeout(() => {
      setCopied(null)
      copyResetTimerRef.current = null
    }, 2200)
  }

  const handleNextTour = () => {
    if (panel === 'dashboard') {
      goToPanel(currentTour.panel)
      return
    }
    if (tourIndex < TOUR_STEPS.length - 1) {
      goToPanel(TOUR_STEPS[tourIndex + 1].panel)
    } else {
      goToPanel('dashboard')
    }
  }

  const panelView = panel === 'dashboard' ? <DashboardPanel deposit={deposit} withdrawal={withdrawal} totalEarnings={totalEarnings} releasedRefund={releasedRefund} taskEarnings={taskEarnings} inviteCommission={inviteCommission} rebate={rebate} isTrained={isTrained} activePlan={activePlan} doneTasksToday={doneTasksToday} pendingTasks={pendingTasks} activities={activities} onNavigate={goToPanel} />
    : panel === 'training' ? <TrainingPanel isTrained={isTrained} isWatching={isWatchingTraining} videoWatched={trainingVideoWatched} videoError={trainingVideoError} onStart={startTraining} onBack={() => { setIsWatchingTraining(false); setTrainingVideoWatched(false); setTrainingVideoError(false) }} onVideoEnded={() => setTrainingVideoWatched(true)} onVideoError={() => setTrainingVideoError(true)} onFinish={completeTraining} onShortcut={previewCompletedTraining} />
      : panel === 'plans' ? <PlansPanel activePlan={activePlan} deposit={deposit} message={planMessage} onUpgrade={upgradePlan} />
        : panel === 'tasks' ? <TasksPanel tasks={DEMO_TASKS} completedTaskIds={completedTaskIds} activeTask={activeTask} planMessage={planMessage} videoWatched={taskVideoWatched} secondsRemaining={taskSecondsRemaining} videoError={taskVideoError} dailyCap={activePlan.dailyCap} doneTasksToday={doneTasksToday} onStart={startTask} onExit={resetTaskPlayer} onDashboard={() => goToPanel('dashboard')} onVideoEnded={() => setTaskVideoWatched(true)} onVideoError={() => setTaskVideoError(true)} onSkipPlayback={() => { setTaskVideoWatched(true); setTaskSecondsRemaining(0); setAnnouncement('Demo-only playback shortcut used. Task is ready to submit.') }} onComplete={completeTask} />
          : panel === 'wallet' ? <WalletPanel deposit={deposit} withdrawal={withdrawal} totalEarnings={totalEarnings} taskEarnings={taskEarnings} inviteCommission={inviteCommission} rebate={rebate} releasedRefund={releasedRefund} history={history} />
            : <InvitesPanel invites={INITIAL_INVITES} copied={copied} onCopy={copyPreview} />

  return (
    <section id="demo" className="demo-section" aria-labelledby="demo-heading">
      <div className="demo-section-inner">
        <header className="demo-section-header">
          <p className="demo-overline">TRY THE REAL WORKFLOW</p>
          <h2 id="demo-heading">A little preview.<br /><em>A clearer next step.</em></h2>
          <p>Move through the member workspace in a safe, local sample. See how training, access, tasks, wallets, and invites connect before you commit to anything.</p>
        </header>

        <div className="demo-tour" aria-label="Guided workflow tour">
          <div className="demo-tour-heading"><div><p className="demo-kicker">GUIDED WORKFLOW</p><h3>{currentTour.title}</h3><p>{currentTour.copy}</p></div><span>Step {Math.max(1, tourIndex + 1)} of {TOUR_STEPS.length}</span></div>
          <div className="demo-tour-steps">{TOUR_STEPS.map((step, index) => <button key={step.panel} className={`demo-tour-step ${activeTourPanel === step.panel ? 'is-active' : ''} ${index < tourIndex ? 'is-past' : ''}`} type="button" onClick={() => goToPanel(step.panel)} aria-current={activeTourPanel === step.panel ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{step.label}</button>)}</div>
          <button className="demo-tour-next" type="button" onClick={handleNextTour}>{panel === 'dashboard' ? 'Start: Training' : tourIndex < TOUR_STEPS.length - 1 ? `Next: ${TOUR_STEPS[tourIndex + 1].label}` : 'Back to dashboard'} <DemoIcon name="arrow-right" size={15} /></button>
        </div>

        <div className="demo-app-window">
          <div className="demo-window-chrome"><div className="demo-window-title"><span className="demo-window-mark"><span /></span><strong>AdPulseAI</strong><span>/</span><span>Member workspace</span></div><div className="demo-window-tools"><span className="demo-window-badge"><span /> Interactive demo</span><button type="button" onClick={resetDemo} aria-label="Reset interactive demo"><DemoIcon name="refresh" size={14} /> <span>Reset</span></button></div><p className="demo-window-sample">Sample data · no real transactions</p></div>
          <div className="demo-window-body">
            <aside className="demo-sidebar" aria-label="Member workspace navigation"><div className="demo-sidebar-brand"><img src="/assets/logo.png" alt="" /><span>AdPulse<span>AI</span></span></div><nav>{navItems.map((item) => <button className={panel === item.panel ? 'is-active' : ''} key={item.panel} type="button" onClick={() => goToPanel(item.panel)} aria-current={panel === item.panel ? 'page' : undefined}><DemoIcon name={item.icon} size={17} /><span>{item.label}</span></button>)}</nav><div className="demo-sidebar-note"><DemoIcon name="shield" size={15} /><span>Representative account<br />not a live login</span></div></aside>
            <div className="demo-workspace">
              <div className="demo-workspace-topbar"><div><p>Member workspace</p><strong>{panelMeta[panel].label}</strong><span>{panelMeta[panel].description}</span></div><div className="demo-user-chip"><span className="demo-user-avatar">AD</span><span>Demo member</span></div></div>
              <nav className="demo-mobile-nav" aria-label="Compact member navigation">{navItems.map((item) => <button className={panel === item.panel ? 'is-active' : ''} key={item.panel} type="button" onClick={() => goToPanel(item.panel)} aria-current={panel === item.panel ? 'page' : undefined}><DemoIcon name={item.icon} size={15} /><span>{item.label === 'Payments' ? 'Wallet' : item.label === 'My Tasks' ? 'Tasks' : item.label}</span></button>)}</nav>
              <div className="demo-workspace-main" role="region" aria-labelledby="demo-panel-heading">{panelView}</div>
            </div>
          </div>
          <footer className="demo-window-footer"><span><DemoIcon name="shield" size={14} /> Sample data · no real transactions</span><span>Demo state resets locally</span></footer>
        </div>

        <footer className="demo-safety-footer"><div><DemoIcon name="shield" size={19} /><div><strong>A representative preview, not a live account.</strong><p>Amounts, statuses, and referral rows are fixtures. No login, payment, wallet transfer, certification, or sharing action is performed here.</p></div></div><span>For orientation only</span></footer>
        <span className="demo-sr-only" role="status" aria-live="polite">{announcement}</span>
      </div>
    </section>
  )
}
