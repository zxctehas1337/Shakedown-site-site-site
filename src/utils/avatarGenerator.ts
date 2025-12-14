/**
 * Генерирует автоматическую аватарку на основе имени пользователя
 * Использует цветовую схему и первую букву имени
 */

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
  '#FFD3B6', '#FFAAA5', '#FF8B94', '#A8D8EA', '#AA96DA'
]

export function generateAvatarUrl(username: string): string {
  // Генерируем цвет на основе хеша имени
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colors.length
  const backgroundColor = colors[colorIndex]
  
  // Берем первую букву имени
  const initial = username.charAt(0).toUpperCase()
  
  // Создаем SVG аватарку
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${backgroundColor}" rx="50%"/>
      <text x="20" y="26" font-size="20" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
        ${initial}
      </text>
    </svg>
  `
  
  // Конвертируем SVG в Data URL
  const encodedSvg = encodeURIComponent(svg.trim())
  return `data:image/svg+xml,${encodedSvg}`
}

export function getAvatarUrl(userAvatar: string | undefined, username: string): string {
  return userAvatar || generateAvatarUrl(username)
}
