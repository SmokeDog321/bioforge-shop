import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty">
          <h2 style={{ marginBottom: '1rem' }}>Корзина пуста</h2>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <h1>Корзина</h1>
      {items.map(item => (
        <div className="cart-item" key={item.id}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="cart-item-image" />
          ) : (
            <div className="cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-hover)' }}>📦</div>
          )}
          <div className="cart-item-info">
            <h3>{item.name}</h3>
            <div className="price">{item.price.toLocaleString('ru-RU')} ₽</div>
          </div>
          <div className="cart-item-actions">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => removeItem(item.id)} style={{ color: 'var(--danger)' }}>✕</button>
          </div>
        </div>
      ))}
      <div className="cart-total">
        Итого: {total.toLocaleString('ru-RU')} ₽
      </div>
      <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Оформить заказ
        </button>
      </div>
    </div>
  )
}
