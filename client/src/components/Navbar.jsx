import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">BioForge.com</Link>
      <div className="navbar-links">
        <Link to="/catalog">Каталог</Link>
        <Link to="/cart" className="cart-badge">
          Корзина
          {count > 0 && <span className="badge">{count}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/admin">Админ</Link>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <Link to="/login">Войти</Link>
        )}
      </div>
    </nav>
  )
}
