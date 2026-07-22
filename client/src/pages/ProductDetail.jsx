import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ModelViewer from '../components/ModelViewer'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState(false)
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setProduct)
      .catch(() => navigate('/catalog'))
  }, [id, navigate])

  const handleAdd = () => {
    addItem(product, quantity)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  if (!product) return <div className="container">Загрузка...</div>

  return (
    <div className="container">
      <div className="product-detail">
        <div>
          {show3D && product.model_3d ? (
            <ModelViewer url={product.model_3d} />
          ) : product.image ? (
            <img src={product.image} alt={product.name} className="product-detail-image" />
          ) : (
            <div className="product-image-placeholder" style={{ height: 400, borderRadius: 12 }}>📦</div>
          )}
          {product.model_3d && (
            <div style={{ marginTop: '1rem' }}>
              <button
                className={`btn ${show3D ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setShow3D(!show3D)}
              >
                {show3D ? '📷 Фото' : '🔄 3D просмотр'}
              </button>
            </div>
          )}
        </div>
        <div className="product-detail-info">
          {product.category && <div className="product-category">{product.category}</div>}
          <h1>{product.name}</h1>
          <div className="price">{product.price.toLocaleString('ru-RU')} ₽</div>
          {product.description && (
            <div className="description">{product.description}</div>
          )}
          <div className="quantity-selector">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            Добавить в корзину
          </button>
        </div>
      </div>
      {toast && <div className="toast">Добавлено в корзину!</div>}
    </div>
  )
}
