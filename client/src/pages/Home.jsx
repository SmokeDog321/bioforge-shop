import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    fetch('/api/products?limit=3')
      .then(r => r.json())
      .then(data => setFeatured(data.slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div>
      <section className="hero">
        <h1>
          Лучшие товары<br />
          <span>с доставкой</span>
        </h1>
        <p>Находите уникальные товары по выгодным ценам. Быстрая доставка по всей России.</p>
        <Link to="/catalog" className="btn btn-primary">
          Смотреть каталог
        </Link>
      </section>

      {featured.length > 0 && (
        <div className="container">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Популярные товары</h2>
          <div className="products-grid">
            {featured.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="product-card">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">📦</div>
                )}
                <div className="product-info">
                  {p.category && <div className="product-category">{p.category}</div>}
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">{p.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
