'use client'

import { createContext, useContext, ReactNode } from 'react'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'

type Locale = 'en' | 'zh'
type Translations = typeof en

const translations: Record<Locale, Translations> = { en, zh }

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

function getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((acc, part) => acc?.[part], obj) || path
}

function interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text
    return Object.entries(params).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }, text)
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const locale: Locale = 'zh'
    const setLocale = (_newLocale: Locale) => { }

    const t = (key: string, params?: Record<string, string | number>): string => {
        const text = getNestedValue(translations[locale], key)
        return interpolate(text, params)
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        // Return default values for server-side rendering
        return {
            locale: 'zh' as Locale,
            setLocale: () => { },
            t: (key: string, params?: Record<string, string | number>) => {
                const text = getNestedValue(zh, key)
                return interpolate(text, params)
            }
        }
    }
    return context
}
