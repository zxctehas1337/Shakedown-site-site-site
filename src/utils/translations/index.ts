// Главный файл системы переводов ShakeDown

import type { Language, TranslationStructure } from './types'
import { ruTranslations } from './ru'
import { enTranslations } from './en'
import { ukTranslations } from './uk'

// Экспорт типов
export type { Language, TranslationStructure }

// Объект со всеми переводами
export const translations: Record<Language, TranslationStructure> = {
  ru: ruTranslations,
  en: enTranslations,
  uk: ukTranslations
}

// Хук для получения переводов
export function getTranslation(lang: Language): TranslationStructure {
  return translations[lang] || translations.ru
}

// Получить текущий язык из localStorage
export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('language')
  if (saved && (saved === 'ru' || saved === 'en' || saved === 'uk')) {
    return saved
  }
  return 'ru'
}

// Установить язык в localStorage
export function setCurrentLanguage(lang: Language): void {
  localStorage.setItem('language', lang)
}

// Проверить, является ли строка валидным языком
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'ru' || lang === 'en' || lang === 'uk'
}