'use client'

import { I18nProvider } from '@/lib/i18n/context'
import { Toaster } from 'sonner'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeColorProvider } from './theme-color-provider'

interface ProvidersProps {
    children: React.ReactNode
    themeColor?: string | null
}

export function Providers({ children, themeColor }: ProvidersProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
            <ThemeColorProvider color={themeColor || null}>
                <I18nProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                </I18nProvider>
            </ThemeColorProvider>
        </NextThemesProvider>
    )
}
