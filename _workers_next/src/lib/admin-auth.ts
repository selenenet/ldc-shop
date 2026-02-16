type AdminIdentity = {
    username?: string | null
    name?: string | null
} | null | undefined

export function getAdminUsernames() {
    return (process.env.ADMIN_USERS || "")
        .split(",")
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean)
}

export function getAdminIdentity(user?: AdminIdentity) {
    const username = user?.username?.trim()
    if (username) return username

    const name = user?.name?.trim()
    if (name) return name

    return null
}

export function isAdminUsername(username?: string | null) {
    const normalized = username?.trim().toLowerCase()
    if (!normalized) return false
    return getAdminUsernames().includes(normalized)
}

export function isAdminUser(user?: AdminIdentity) {
    return isAdminUsername(getAdminIdentity(user))
}
