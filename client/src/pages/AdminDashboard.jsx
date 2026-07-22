import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/products/admin/all', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([products, orders]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        revenue: orders.reduce((sum, o) => sum + o.total, 0),
        pending: orders.filter(o => o.status === 'pending').length,
      })
    })
  }, [])

  const cards = [
    { label: 'Товаров', value: stats.products, color: 'var(--primary)' },
    { label: 'Заказов', value: stats.orders, color: 'var(--accent)' },
    { label: 'Выручка', value: `${stats.revenue.toLocaleString('ru-RU')} ₽`, color: 'var(--success)' },
    { label: 'Ожидают', value: stats.pending, color: 'var(--warning)' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
