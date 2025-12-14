import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NewsPost } from '../types'
import AnimatedBackground from '../components/AnimatedBackground'
import LogoWithHat from '../components/LogoWithHat'
import { IconHome, IconEmpty, IconAuthor } from '../components/Icons'
import { CLIENT_INFO } from '../utils/constants'
import '../styles/NewsPage.css'

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [filter, setFilter] = useState<'all' | 'launcher' | 'website'>('all')
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

  useEffect(() => {
    loadNews()
    
    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      loadNews()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const loadNews = () => {
    const savedNews = JSON.parse(localStorage.getItem('insideNews') || '[]')
    setNews(savedNews)
  }

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(n => n.type === filter)

  return (
    <div className="news-page">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <LogoWithHat
                alt="Shakedown"
                size={32}
                className="no-user-drag"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              <span className="version">{CLIENT_INFO.name}</span>
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="active">
              <IconHome className="nav-icon" />
              Главная
            </Link>
            {!currentUser && <Link to="/auth">Войти</Link>}
          </div>
          {currentUser ? (
            <Link to="/dashboard" className="btn-nav">
              <img 
                src={currentUser.avatar || '/icon.ico'} 
                alt="Avatar" 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  marginRight: '8px',
                  objectFit: 'cover'
                }} 
              />
              {currentUser.username}
            </Link>
          ) : (
            <Link to="/auth" className="btn-nav">Личный кабинет</Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="news-hero">
        <div className="container">
          <div className="news-hero-content">
            <h1>Новости <span className="gradient-text">{CLIENT_INFO.name}</span></h1>
            <p>Последние обновления, анонсы и новости проекта</p>
          </div>
          
          {/* Filter */}
          <div className="news-filter">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все новости
            </button>
            <button 
              className={`filter-btn ${filter === 'website' ? 'active' : ''}`}
              onClick={() => setFilter('website')}
            >
              Сайт
            </button>
            <button 
              className={`filter-btn ${filter === 'launcher' ? 'active' : ''}`}
              onClick={() => setFilter('launcher')}
            >
              Лаунчер
            </button>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="news-section">
        <div className="container">
          {filteredNews.length === 0 ? (
            <div className="empty-news">
              <IconEmpty />
              <h3>Новостей пока нет</h3>
              <p>Следите за обновлениями</p>
            </div>
          ) : (
            <div className="news-grid">
              {filteredNews.map(post => (
                <article key={post.id} className="news-article">
                  <div className="news-article-header">
                    <span className={`news-type-badge ${post.type}`}>
                      {post.type === 'launcher' ? 'Лаунчер' : 'Сайт'}
                    </span>
                    <span className="news-date">
                      {new Date(post.date).toLocaleDateString('ru-RU', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.content}</p>
                  <div className="news-article-footer">
                    <div className="news-author">
                      <IconAuthor />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <LogoWithHat
                alt="Shakedown"
                size={32}
                className="no-user-drag"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              <span>{CLIENT_INFO.name}</span>
            </div>
            <div className="footer-links">
              <Link to="/">Главная</Link>
              <Link to="/news">Новости</Link>
              <Link to="/auth">Войти</Link>
              <Link to="/personal-data">Обработка персональных данных</Link>
              <Link to="/user-agreement">Пользовательское соглашение</Link>
              <Link to="/usage-rules">Правила пользования</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 {CLIENT_INFO.name}. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
