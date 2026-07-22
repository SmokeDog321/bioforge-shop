import { Link } from 'react-router-dom'

export default function OrderSuccess() {
  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h1>Заказ оформлен!</h1>
      <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
        Мы свяжемся с вами для подтверждения заказа.
      </p>
      <Link to="/catalog" className="btn btn-primary">Вернуться в каталог</Link>
    </div>
  )
}
