import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) return <div className="container">Загрузка...</div>
  if (!user) return <Navigate to="/login" />

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
          Товары
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
          Заказы
        </NavLink>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
