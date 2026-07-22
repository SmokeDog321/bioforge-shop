import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён'
}

export default function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')

  const fetchOrders = () => {
    let url = '/api/orders'
    if (filter) url += `?status=${filter}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setOrders)
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateStatus = async (id, status) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    fetchOrders()
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Заказы ({orders.length})</h1>
      </div>

      <div className="categories" style={{ marginBottom: '1.5rem' }}>
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            className={`category-chip ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s ? STATUS_LABELS[s] : 'Все'}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="cart-empty">Заказов пока нет</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Клиент</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.customer_email}</td>
                <td>{o.customer_phone || '—'}</td>
                <td>{o.total.toLocaleString('ru-RU')} ₽</td>
                <td>
                  <span className={`status-badge status-${o.status}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    style={{
                      padding: '0.4rem',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: 'var(--text)',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
