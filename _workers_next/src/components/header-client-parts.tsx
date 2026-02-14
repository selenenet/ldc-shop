'use client'

import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ShoppingBag, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getMyUnreadCount } from "@/actions/user-notifications"

export function HeaderLogo({ adminName, shopNameOverride, shopLogoOverride }: { adminName?: string; shopNameOverride?: string | null; shopLogoOverride?: string | null }) {
    const { t } = useI18n()
    const override = shopNameOverride?.trim()
    const logoUrl = shopLogoOverride?.trim()
    const shopName = adminName
        ? t('common.shopNamePattern', { name: adminName, appName: t('common.appName') })
        : t('common.appName')

    return (
        <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full border border-[#2a3443] bg-[#111821]/90 px-2.5 py-2 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors duration-200 hover:border-[#e11d2e66]"
        >
            {logoUrl ? (
                <img src={logoUrl} alt="店铺标志" className="h-9 w-9 rounded-full object-cover" />
            ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e11d2e] text-white shadow-[0_0_18px_rgba(225,29,46,0.45)]">
                    <ShoppingBag className="h-4 w-4" />
                </span>
            )}
            <span className="font-display max-w-[180px] truncate text-base font-semibold tracking-tight text-white sm:max-w-[220px]">
                {override || shopName}
            </span>
        </Link>
    )
}

export function HeaderNav({ isAdmin, isLoggedIn, showNav = true }: { isAdmin: boolean; isLoggedIn: boolean; showNav?: boolean }) {
    const { t } = useI18n()

    return (
        <div className="hidden items-center gap-4 xl:flex">
            {showNav && (
                <Link
                    href="/nav"
                    className="text-sm font-medium text-[#95a4b8] transition-colors hover:text-white"
                >
                    {t('common.navigator')}
                </Link>
            )}
            {isLoggedIn && (
                <Link
                    href="/profile"
                    className="text-sm font-medium text-[#95a4b8] transition-colors hover:text-white"
                >个人中心</Link>
            )}
            {isAdmin && (
                <Link
                    href="/admin/settings"
                    className="text-sm font-medium text-[#95a4b8] transition-colors hover:text-white"
                >
                    {t('common.admin')}
                </Link>
            )}
        </div>
    )
}

export function HeaderSearch({ className, inputClassName }: { className?: string; inputClassName?: string }) {
    const { t } = useI18n()
    const router = useRouter()
    const [q, setQ] = useState("")

    return (
        <form
            className={cn("w-full", className)}
            onSubmit={(e) => {
                e.preventDefault()
                const query = q.trim()
                if (!query) return
                router.push(`/search?q=${encodeURIComponent(query)}`)
            }}
        >
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8ea3]" />
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className={cn(
                        "h-10 rounded-full border-[#2f3948] bg-transparent pl-9 text-sm text-white placeholder:text-[#67768b]",
                        inputClassName
                    )}
                />
            </div>
        </form>
    )
}

export function HeaderUserMenuItems({ isAdmin, showNav = true }: { isAdmin: boolean; showNav?: boolean }) {
    const { t } = useI18n()

    return (
        <>
            {showNav && (
                <DropdownMenuItem asChild>
                    <Link href="/nav">{t('common.navigator')}</Link>
                </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
                <Link href="/profile" className="flex w-full items-center justify-between gap-2">
                    <span>个人中心</span>
                    <HeaderUnreadBadge className="ml-2" />
                </Link>
            </DropdownMenuItem>
            {isAdmin && (
                <DropdownMenuItem asChild>
                    <Link href="/admin/settings">{t('common.admin')}</Link>
                </DropdownMenuItem>
            )}
        </>
    )
}

export { LanguageSwitcher }

export function HeaderUnreadBadge({ initialCount = 0, desktopEnabled = false, className }: { initialCount?: number; desktopEnabled?: boolean; className?: string }) {
    const { t } = useI18n()
    const [count, setCount] = useState(initialCount)
    const pathname = usePathname()
    const prevCountRef = useRef(initialCount)

    const refresh = useCallback(async () => {
        try {
            const res = await getMyUnreadCount()
            if (res?.success) {
                const nextCount = res.count || 0
                setCount(nextCount)
                if (desktopEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    if (nextCount > prevCountRef.current) {
                        new Notification(t('profile.desktopNotifications.newTitle'), {
                            body: t('profile.desktopNotifications.newBody', { count: nextCount })
                        })
                    }
                }
                prevCountRef.current = nextCount
            }
        } catch {
            // ignore
        }
    }, [desktopEnabled, t])

    useEffect(() => {
        refresh()
    }, [pathname, refresh])

    useEffect(() => {
        const handler = () => {
            void refresh()
        }
        if (typeof window !== "undefined") {
            window.addEventListener("ldc:notifications-updated", handler)
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("ldc:notifications-updated", handler)
            }
        }
    }, [refresh])

    if (!count) return null

    return (
        <span className={cn("inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e11d2e] px-1 text-[10px] font-medium text-white", className)}>
            {count > 99 ? "99+" : count}
        </span>
    )
}



