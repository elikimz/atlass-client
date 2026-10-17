export type DemoPanel = 'dashboard' | 'training' | 'plans' | 'tasks' | 'wallet' | 'invites'

export type TourPanel = Exclude<DemoPanel, 'dashboard'>

export interface PlanFixture {
  name: string
  price: number
  validityDays: number
  dailyCap: number
}

export interface DemoTask {
  id: string
  title: string
  description: string
  reward: number
  videoUrl: string
}

export interface ActivityItem {
  id: string
  label: string
  amount: string
  tone: 'positive' | 'neutral' | 'pending'
}

export interface HistoryItem {
  id: string
  kind: 'deposit' | 'payout' | 'earning' | 'refund' | 'plan'
  label: string
  amount: string
  status: 'approved' | 'pending' | 'rejected' | 'review'
}

export interface InviteRow {
  name: string
  status: 'Active' | 'Training' | 'New'
  tier: 'A' | 'B' | 'C'
}

export const PLANS: PlanFixture[] = [
  { name: 'Intern', price: 0, validityDays: 3, dailyCap: 2 },
  { name: 'LV1', price: 20, validityDays: 60, dailyCap: 2 },
  { name: 'LV2', price: 50, validityDays: 60, dailyCap: 5 },
  { name: 'LV3', price: 100, validityDays: 60, dailyCap: 7 },
  { name: 'LV4', price: 150, validityDays: 60, dailyCap: 10 },
  { name: 'LV5', price: 200, validityDays: 60, dailyCap: 15 },
]

export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'task-01',
    title: 'Sample video task 01',
    description: 'Illustrative task entry; availability and content vary by account.',
    reward: 0.4,
    videoUrl: '/assets/demo-review.mp4',
  },
  {
    id: 'task-02',
    title: 'Sample video task 02',
    description: 'Illustrative task entry; availability and content vary by account.',
    reward: 0.4,
    videoUrl: '/assets/demo-review.mp4',
  },
]

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'activity-invite', label: 'Invite commission credited', amount: '+$4.00', tone: 'positive' },
  { id: 'activity-tasks', label: 'Task earnings to date', amount: '+$8.40', tone: 'positive' },
  { id: 'activity-plan', label: 'Intern trial activated', amount: '$0.00', tone: 'neutral' },
]

export const INITIAL_HISTORY: HistoryItem[] = [
  { id: 'history-deposit', kind: 'deposit', label: 'Opening sample deposit', amount: '+$80.00', status: 'approved' },
  { id: 'history-commission', kind: 'earning', label: 'Invite commission fixture', amount: '+$4.00', status: 'approved' },
  { id: 'history-task', kind: 'earning', label: 'Task earnings fixture', amount: '+$8.40', status: 'approved' },
  { id: 'history-pending-deposit', kind: 'deposit', label: 'Pending sample deposit · not credited', amount: '+$20.00', status: 'pending' },
  { id: 'history-rejected-payout', kind: 'payout', label: 'Rejected payout · returned funds', amount: '-$3.00', status: 'rejected' },
]

export const INITIAL_INVITES: InviteRow[] = [
  { name: 'Sample member A', status: 'Active', tier: 'A' },
  { name: 'Sample member B', status: 'Training', tier: 'B' },
  { name: 'Sample member C', status: 'New', tier: 'C' },
]

export const TOUR_STEPS: Array<{
  panel: TourPanel
  label: string
  eyebrow: string
  title: string
  copy: string
  nextLabel: string
}> = [
  {
    panel: 'training',
    label: 'Training',
    eyebrow: 'STEP 1 · GET ORIENTED',
    title: 'Start with the workflow.',
    copy: 'Preview the short Video Reviewing Mastery sample before choosing a plan.',
    nextLabel: 'Preview training',
  },
  {
    panel: 'plans',
    label: 'Plans',
    eyebrow: 'STEP 2 · CHOOSE ACCESS',
    title: 'See the available terms.',
    copy: 'Compare the example terms: validity and daily task cap.',
    nextLabel: 'View plans',
  },
  {
    panel: 'tasks',
    label: 'Tasks',
    eyebrow: 'STEP 3 · WORK THE QUEUE',
    title: 'Watch, wait, complete.',
    copy: 'The sample player mirrors the real flow: video first, 20-second wait, then completion.',
    nextLabel: 'Open tasks',
  },
  {
    panel: 'wallet',
    label: 'Wallet',
    eyebrow: 'STEP 4 · FOLLOW THE LEDGER',
    title: 'Keep balances separate.',
    copy: 'Deposit funds stay separate from task earnings, invite commissions, and released refunds.',
    nextLabel: 'Open wallet',
  },
  {
    panel: 'invites',
    label: 'Invites',
    eyebrow: 'STEP 5 · SEE THE NETWORK',
    title: 'Invite activity stays visible.',
    copy: 'Review a read-only referral preview with configurable tier caps and no sharing to real people.',
    nextLabel: 'Open invites',
  },
]

export const formatCurrency = (value: number): string => `$${value.toFixed(2)}`
