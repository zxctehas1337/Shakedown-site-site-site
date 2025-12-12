 // Константы приложения

// Информация о клиенте
export const CLIENT_INFO = {
  name: 'Shakedown Client',
  version: '1.21.4',
  minecraftVersion: '1.21.4',
  platform: 'Windows 10/11'
}

// Ссылки на скачивание лаунчера
export const DOWNLOAD_LINKS = {
  launcher: 'https://www.dropbox.com/scl/fi/kba2qnxug1lr7r0893y6t/ShakeDown-Launcher_0.1.0_x64-setup.exe?rlkey=e84vj49yiiosi76w5dn7eldus&st=le42exs4&dl=1',
}

// Социальные сети (заполнишь позже)
export const SOCIAL_LINKS = {
  discord: '', // Заполнить позже
  telegram: '', // Заполнить позже
  youtube: '',
  vk: ''
}

// Товары/услуги
export const PRODUCTS = [
  {
    id: 'client-30',
    name: 'Клиент на 30 дней',
    price: 199,
    duration: 30,
    description: 'Доступ к клиенту на 30 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка']
  },
  {
    id: 'client-90',
    name: 'Клиент на 90 дней',
    price: 449,
    duration: 90,
    description: 'Доступ к клиенту на 90 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка'],
    popular: true
  },
  {
    id: 'client-lifetime',
    name: 'Клиент навсегда',
    price: 999,
    duration: -1,
    description: 'Пожизненный доступ к клиенту',
    features: ['Полный функционал', 'Все обновления', 'Приоритетная поддержка']
  },
  {
    id: 'hwid-reset',
    name: 'Сброс привязки',
    price: 99,
    description: 'Сброс HWID привязки',
    features: ['Мгновенный сброс', 'Новая привязка']
  }
]

// Способы оплаты
export const PAYMENT_METHODS = {
  youkassa: {
    name: 'ЮKassa',
    enabled: true,
    currencies: ['RUB']
  },
  funpay: {
    name: 'FunPay',
    enabled: true,
    url: '' // Заполнить позже
  }
}

// Доступные языки
export const LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' },
  en: { name: 'English', flag: '🇬🇧' },
  uk: { name: 'Українська', flag: '🇺🇦' }
}

// Доступные темы
export const THEMES = {
  dark: { name: 'Тёмная', icon: '🌙' },
  light: { name: 'Светлая', icon: '☀️' }
}

// Видео-обзор
export const MEDIA = {
  videoPreview: 'https://www.youtube.com/embed/YOUR_VIDEO_ID', // Замените на ваше видео
  videoThumbnail: '/video-thumbnail.jpg' // Или используйте скриншот
}
