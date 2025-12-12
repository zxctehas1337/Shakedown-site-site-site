import { useState } from 'react'
import { NewsPost } from '../../../types'

interface NewsTabProps {
  news: NewsPost[]
  onCreatePost: (post: { title: string; content: string; type: 'launcher' | 'website' }) => void
  onDeletePost: (id: number) => void
}

export function NewsTab({ news, onCreatePost, onDeletePost }: NewsTabProps) {
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'website' as 'launcher' | 'website' })

  const handleSubmit = () => {
    onCreatePost(newPost)
    setNewPost({ title: '', content: '', type: 'website' })
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Управление новостями</h2>
        <p>Создавайте новости для лаунчера и сайта</p>
      </div>

      <div className="create-post-card">
        <h3>Создать новость</h3>
        <div className="form-group">
          <label>Заголовок</label>
          <input
            type="text"
            placeholder="Введите заголовок новости"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Содержание</label>
          <textarea
            placeholder="Введите текст новости"
            rows={4}
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Тип публикации</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                checked={newPost.type === 'website'}
                onChange={() => setNewPost({ ...newPost, type: 'website' })}
              />
              <span>Сайт</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                checked={newPost.type === 'launcher'}
                onChange={() => setNewPost({ ...newPost, type: 'launcher' })}
              />
              <span>Лаунчер</span>
            </label>
          </div>
        </div>
        <button className="btn-primary" onClick={handleSubmit}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Опубликовать
        </button>
      </div>

      <div className="news-list">
        <h3>Опубликованные новости ({news.length})</h3>
        {news.length === 0 ? (
          <div className="empty-state">
            <p>Новостей пока нет</p>
          </div>
        ) : (
          news.map(post => (
            <div key={post.id} className="news-card">
              <div className="news-card-header">
                <div>
                  <h4>{post.title}</h4>
                  <div className="news-meta">
                    <span className={`news-badge ${post.type}`}>{post.type === 'launcher' ? 'Лаунчер' : 'Сайт'}</span>
                    <span>{new Date(post.date).toLocaleDateString('ru-RU')}</span>
                    <span>Автор: {post.author}</span>
                  </div>
                </div>
                <button className="btn-delete" onClick={() => onDeletePost(post.id)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
              <p>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
