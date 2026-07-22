import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_email || !form.customer_address) {
      setError('Заполните все обязательные поля')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Create order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, total })
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      // Try Stripe payment
      const payRes = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, orderId: order.id })
      })
      const payData = await payRes.json()

      if (payData.url) {
        window.location.href = payData.url
        return
      }

      // Demo mode or no Stripe
      clearCart()
      navigate('/order-success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Оформление заказа</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label>Имя *</label>
          <input
            type="text"
            value={form.customer_name}
            onChange={e => setForm({ ...form, customer_name: e.target.value })}
            placeholder="Ваше имя"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={form.customer_email}
            onChange={e => setForm({ ...form, customer_email: e.target.value })}
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Телефон</label>
          <input
            type="tel"
            value={form.customer_phone}
            onChange={e => setForm({ ...form, customer_phone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div className="form-group">
          <label>Адрес доставки *</label>
          <textarea
            value={form.customer_address}
            onChange={e => setForm({ ...form, customer_address: e.target.value })}
            placeholder="Город, улица, дом, квартира"
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ваш заказ:</div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Итого:</span>
            <span style={{ color: 'var(--primary-light)' }}>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Оформление...' : 'Оплатить'}
        </button>
      </form>
    </div>
  )
}
