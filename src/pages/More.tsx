import { Link } from 'react-router-dom'

type MoreProps = { isAdmin?: boolean }
type Destination = { title: string; description: string; path: string; glyph: string }
type DestinationGroup = { title: string; items: Destination[] }

export default function More({ isAdmin = false }: MoreProps) {
  const groups: DestinationGroup[] = [
    {
      title: 'Learning & development',
      items: [
        { title: 'Training', description: 'Your guided learning and certification progress.', path: '/training', glyph: '01' },
        { title: 'Learning hub', description: 'Courses and learning material in one place.', path: '/training/hub', glyph: '02' },
      ],
    },
    {
      title: 'Wallet records',
      items: [
        { title: 'Payment activity', description: 'Review deposit and payout request stages.', path: '/payments/history', glyph: '03' },
        { title: 'Payout accounts', description: 'Manage destinations used for withdrawals.', path: '/withdrawal-accounts', glyph: '04' },
      ],
    },
    {
      title: 'Account & support',
      items: [
        { title: 'Account settings', description: 'Profile, security and account details.', path: '/settings', glyph: '05' },
        { title: 'Help & feedback', description: 'Send a question or share your experience.', path: '/feedback', glyph: '06' },
      ],
    },
  ]

  if (isAdmin) {
    groups.push({
      title: 'Administration',
      items: [{ title: 'Control room', description: 'Open the protected operations workspace.', path: '/admin', glyph: '07' }],
    })
  }

  return (
    <div className="more-page">
      <header className="more-page-intro">
        <div className="more-page-intro-copy">
          <span className="member-eyebrow">PACECRAFT / ALL DESTINATIONS</span>
          <h2>More of your workspace.</h2>
          <p>Learning, account tools and wallet records—together on one page.</p>
        </div>
        <Link className="more-home-link" to="/dashboard">Back to dashboard <span aria-hidden="true">↗</span></Link>
      </header>

      <div className="more-destination-groups">
        {groups.map((group) => (
          <section className="more-destination-group" key={group.title} aria-label={group.title}>
            <div className="more-destination-heading">
              <span className="member-eyebrow">PACECRAFT DIRECTORY</span>
              <h3>{group.title}</h3>
            </div>
            <div className="more-destination-grid">
              {group.items.map((item) => (
                <Link className="more-destination-card" to={item.path} key={item.path}>
                  <span className="more-destination-index" aria-hidden="true">{item.glyph}</span>
                  <span className="more-destination-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                  <span className="more-destination-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
