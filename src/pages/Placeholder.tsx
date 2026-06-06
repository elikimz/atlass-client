export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-heading)' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>This page is coming soon.</p>
    </div>
  )
}
