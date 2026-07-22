import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: 0, image: '', model_3d: '' })

  const fetchProducts = () => {
    fetch('/api/products/admin/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setProducts)
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }

    if (editing) {
      await fetch(`/api/products/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
    }
    setShowModal(false)
    setEditing(null)
    setForm({ name: '', description: '', price: '', category: '', stock: 0, image: '', model_3d: '' })
    fetchProducts()
  }

  const handleEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category || '', stock: p.stock, image: p.image || '',
      model_3d: p.model_3d || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchProducts()
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Товары ({products.length})</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', category: '', stock: 0, image: '', model_3d: '' }); setShowModal(true) }}>
          + Добавить товар
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Категория</th>
            <th>3D</th>
            <th>Остаток</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                {p.image ? (
                  <img src={p.image} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 50, height: 50, background: 'var(--bg-hover)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString('ru-RU')} ₽</td>
              <td>{p.category || '—'}</td>
              <td>{p.model_3d ? '✅' : '—'}</td>
              <td>{p.stock}</td>
              <td>
                <span className={`status-badge ${p.active ? 'status-delivered' : 'status-cancelled'}`}>
                  {p.active ? 'Активен' : 'Скрыт'}
                </span>
              </td>
              <td className="actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Редактировать товар' : 'Новый товар'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Цена (₽) *</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Электроника, Одежда..." />
              </div>
              <div className="form-group">
                <label>Остаток</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Изображение (URL)</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" />
                {form.image && <img src={form.image} alt="" style={{ width: 100, marginTop: '0.5rem', borderRadius: 8 }} />}
              </div>
              <div className="form-group">
                <label>3D модель (URL) — .glb / .gltf / .stl / .obj — только просмотр</label>
                <input value={form.model_3d || ''} onChange={e => setForm({ ...form, model_3d: e.target.value })} placeholder="https://example.com/model.glb" />
                {form.model_3d && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Модель указана</span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, model_3d: '' }))}>Удалить</button>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Сохранить' : 'Создать'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
