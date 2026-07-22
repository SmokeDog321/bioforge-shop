import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let url = '/api/products'
    const params = []
    if (activeCategory) params.push(`category=${encodeURIComponent(activeCategory)}`)
    if (search) params.push(`search=${encodeURIComponent(search)}`)
    if (params.length) url += '?' + params.join('&')

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setProducts(data)
        if (!activeCategory && !search) {
          const cats = [...new Set(data.map(p => p.category).filter(Boolean))]
          setCategories(cats)
        }
      })
  }, [activeCategory, search])

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Каталог</h1>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {categories.length > 0 && (
        <div className="categories">
          <button
            className={`category-chip ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            Все
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="cart-empty">Товары не найдены</div>
      ) : (
        <div className="products-grid">
          {products.map(p => (
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
      )}
    </div>
  )
}
