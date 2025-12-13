// Главный файл системы переводов ShakeDown

import type { Language, TranslationStructure } from './types'
import { ruTranslations } from './ru'
import { enTranslations } from './en'
import { ukTranslations } from './uk'
import { plTranslations } from './pl'
import { trTranslations } from './tr'

// Экспорт типов
export type { Language, TranslationStructure }

// Объект со всеми переводами
export const translations: Record<Language, TranslationStructure> = {
  ru: ruTranslations,
  en: enTranslations,
  uk: ukTranslations,
  pl: plTranslations,
  tr: trTranslations
}

// Хук для получения переводов
export function getTranslation(lang: Language): TranslationStructure {
  return translations[lang] || translations.ru
}

// Получить текущий язык из localStorage
export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('language')
  if (saved && (saved === 'ru' || saved === 'en' || saved === 'uk' || saved === 'pl' || saved === 'tr')) {
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
  return lang === 'ru' || lang === 'en' || lang === 'uk' || lang === 'pl' || lang === 'tr'
}

// Маппинг языков на локали для форматирования дат
export const dateLocales: Record<Language, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
  pl: 'pl-PL',
  tr: 'tr-TR'
}

// Получить локаль для форматирования дат
export function getDateLocale(lang: Language): string {
  return dateLocales[lang] || 'ru-RU'
}