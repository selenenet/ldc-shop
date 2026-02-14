"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { LogIn } from "lucide-react"

interface SignInButtonProps {
    className?: string
    label?: string
}

export function SignInButton({ className, label }: SignInButtonProps) {
    const { t } = useI18n()

    return (
        <Button
            size="sm"
            className={cn("rounded-full bg-white px-4 text-[#10151d] hover:bg-[#eef0f3]", className)}
            onClick={() => signIn("linuxdo")}
        >
            <LogIn className="h-4 w-4" />
            {label || t('common.login')}
        </Button>
    )
}
