'use client'

import { useI18n } from '@/lib/i18n/context'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
    className?: string
    showLabel?: boolean
}

export function LanguageSwitcher({ className, showLabel = true }: LanguageSwitcherProps) {
    const { t } = useI18n()

    return (
        <span
            className={cn("inline-flex h-9 items-center gap-1 rounded-full px-3 text-[#9eb0c8]", className)}
            title={t('language.switch')}
            aria-label={t('language.switch')}
            aria-hidden="true"
        >
            <Languages className="h-4 w-4" />
            {showLabel ? <span className="hidden sm:inline">多语言</span> : null}
        </span>
    )
}
