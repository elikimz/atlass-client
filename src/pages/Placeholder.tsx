export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>{title}</h1>
      <p style={{ color: '#6b7280' }}>This page is coming soon.</p>
    </div>
  )
}
