import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { SignInButton } from "@/components/signin-button"
import { SignOutButton } from "@/components/signout-button"
import { HeaderLogo, HeaderNav, HeaderSearch, HeaderUserMenuItems, HeaderUnreadBadge } from "@/components/header-client-parts"
import { ModeToggle } from "@/components/mode-toggle"
import { getSetting, recordLoginUser, setSetting, getUserUnreadNotificationCount, getLoginUserDesktopNotificationsEnabled } from "@/lib/db/queries"
import { isRegistryEnabled } from "@/lib/registry"
import { CheckInButton } from "@/components/checkin-button"

export async function SiteHeader() {
    const session = await auth()
    const user = session?.user
    if (user?.id) {
        await recordLoginUser(user.id, user.username || user.name || null, user.email || null)
    }

    const rawAdminUsers = process.env.ADMIN_USERS?.split(',') || []
    const adminUsers = rawAdminUsers.map((u) => u.toLowerCase())
    const isAdmin = (user?.username && adminUsers.includes(user.username.toLowerCase())) || false
    const firstAdminName = rawAdminUsers[0]?.trim()

    let shopNameOverride: string | null = null
    let shopLogoOverride: string | null = null
    try {
        const [name, logo] = await Promise.all([
            getSetting('shop_name'),
            getSetting('shop_logo')
        ])
        shopNameOverride = name
        shopLogoOverride = logo
    } catch {
        shopNameOverride = null
        shopLogoOverride = null
    }

    if (isAdmin && user?.avatar_url && (!shopLogoOverride || !shopLogoOverride.trim())) {
        try {
            await setSetting('shop_logo', user.avatar_url)
            await setSetting('shop_logo_updated_at', String(Date.now()))
            shopLogoOverride = user.avatar_url
        } catch {
            // best effort
        }
    }

    let checkinEnabled = true
    try {
        const v = await getSetting('checkin_enabled')
        checkinEnabled = v !== 'false'
    } catch {
        checkinEnabled = true
    }

    const registryEnabled = isRegistryEnabled()
    let registryOptIn = false
    let registryHideNav = false
    if (registryEnabled) {
        try {
            const [optIn, hideNav] = await Promise.all([
                getSetting('registry_opt_in'),
                getSetting('registry_hide_nav')
            ])
            registryOptIn = optIn === 'true'
            registryHideNav = hideNav === 'true'
        } catch {
            registryOptIn = false
            registryHideNav = false
        }
    }
    const showNavigator = registryEnabled && (registryOptIn || !registryHideNav)

    let unreadCount = 0
    let desktopNotificationsEnabled = false
    if (user?.id) {
        try {
            unreadCount = await getUserUnreadNotificationCount(user.id)
        } catch {
            unreadCount = 0
        }
        try {
            desktopNotificationsEnabled = await getLoginUserDesktopNotificationsEnabled(user.id)
        } catch {
            desktopNotificationsEnabled = false
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#253144]/60 bg-[#090f18]/75 backdrop-blur-xl">
            <div className="container py-4">
                <div className="flex items-center gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <HeaderLogo adminName={firstAdminName} shopNameOverride={shopNameOverride} shopLogoOverride={shopLogoOverride} />
                        <HeaderNav isAdmin={isAdmin} isLoggedIn={!!user} showNav={showNavigator} />
                    </div>

                    <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-[#2b3647] bg-[#111925]/95 p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] lg:flex">
                        <HeaderSearch className="w-72" inputClassName="border-transparent focus-visible:border-[#e11d2e66]" />
                        <span className="mx-1 h-6 w-px bg-[#283243]" />
                        <ModeToggle triggerClassName="h-9 w-9" />

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 overflow-visible rounded-full bg-[#182231] hover:bg-[#202d3f]">
                                        <HeaderUnreadBadge initialCount={unreadCount} desktopEnabled={desktopNotificationsEnabled} className="absolute -right-1 -top-1 z-10 pointer-events-none" />
                                        <Avatar className="relative z-0 h-8 w-8">
                                            <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1">
                                        <CheckInButton enabled={checkinEnabled} />
                                    </div>
                                    <DropdownMenuSeparator />
                                    <HeaderUserMenuItems isAdmin={isAdmin} showNav={showNavigator} />
                                    <DropdownMenuSeparator />
                                    <SignOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SignInButton label="登录" className="h-9 px-4 text-sm font-semibold" />
                        )}
                    </div>

                    <div className="ml-auto flex items-center gap-1 rounded-full border border-[#2b3647] bg-[#111925]/95 p-1.5 lg:hidden">
                        <ModeToggle triggerClassName="h-8 w-8" />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-[#182231] p-0 hover:bg-[#202d3f]">
                                        <HeaderUnreadBadge initialCount={unreadCount} desktopEnabled={desktopNotificationsEnabled} className="absolute -right-1 -top-1 z-10 pointer-events-none" />
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1">
                                        <CheckInButton enabled={checkinEnabled} />
                                    </div>
                                    <DropdownMenuSeparator />
                                    <HeaderUserMenuItems isAdmin={isAdmin} showNav={showNavigator} />
                                    <DropdownMenuSeparator />
                                    <SignOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SignInButton label="登录" className="h-8 px-3 text-xs" />
                        )}
                    </div>
                </div>

                {isAdmin ? (
                    <div className="pt-3 xl:hidden">
                        <Link href="/admin/settings" className="text-xs font-medium text-[#8ea0b7] hover:text-white">管理</Link>
                    </div>
                ) : null}
            </div>
        </header>
    )
}



