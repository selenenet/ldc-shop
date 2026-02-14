'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import type { ReactNode } from "react"

interface FooterContentProps {
    customFooter: string | null
    version: string
}

export function FooterContent({ customFooter, version }: FooterContentProps) {
    const { t } = useI18n()
    const footerText = customFooter?.trim() || t('footer.disclaimer')

    const linkify = (text: string) => {
        const nodes: ReactNode[] = []
        const urlRegex = /https?:\/\/[^\s]+/g
        let lastIndex = 0
        let match: RegExpExecArray | null
        let linkIndex = 0

        while ((match = urlRegex.exec(text)) !== null) {
            const [raw] = match
            const start = match.index
            if (start > lastIndex) {
                nodes.push(text.slice(lastIndex, start))
            }

            let url = raw
            let trailing = ''
            while (url.length && /[),.!?]/.test(url[url.length - 1])) {
                trailing = url[url.length - 1] + trailing
                url = url.slice(0, -1)
            }

            if (url) {
                nodes.push(
                    <a
                        key={`footer-link-${linkIndex++}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#9cb0cb] transition-colors hover:text-white"
                    >
                        {url}
                    </a>
                )
            }
            if (trailing) nodes.push(trailing)
            lastIndex = start + raw.length
        }

        if (lastIndex < text.length) {
            nodes.push(text.slice(lastIndex))
        }

        return nodes
    }

    const renderFooterText = (text: string) => {
        const lines = text.split(/\r?\n/)
        return lines.flatMap((line, idx) => {
            const parts = linkify(line)
            if (idx < lines.length - 1) {
                return [...parts, <br key={`footer-br-${idx}`} />]
            }
            return parts
        })
    }

    return (
        <footer className="mt-auto border-t border-[#263247] bg-[#070b12] pb-20 pt-14 md:pb-10">
            <div className="container">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2f3b4d] bg-[#111a27] text-sm font-bold text-[#dbe7f7]">
                                LD
                            </div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-white">LDC 商店</p>
                        </div>
                        <p className="text-sm leading-relaxed text-[#93a3ba] footer-html">
                            {renderFooterText(footerText)}
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 font-display text-xl font-semibold text-white">商城导航</h4>
                        <div className="space-y-2 text-sm text-[#91a3bc]">
                            <Link href="/" className="block transition-colors hover:text-white">全部商品</Link>
                            <Link href="/?sort=soldDesc" className="block transition-colors hover:text-white">热门推荐</Link>
                            <Link href="/?sort=priceAsc" className="block transition-colors hover:text-white">优惠价格</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-display text-xl font-semibold text-white">帮助支持</h4>
                        <div className="space-y-2 text-sm text-[#91a3bc]">
                            <Link href="/orders" className="block transition-colors hover:text-white">我的订单</Link>
                            <Link href="/profile" className="block transition-colors hover:text-white">个人中心</Link>
                            <a href="https://connect.linux.do" target="_blank" rel="noreferrer" className="block transition-colors hover:text-white">Linux DO 互联</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-display text-xl font-semibold text-white">Selene的小站</h4>
                        <p className="mb-3 text-sm font-medium text-[#dce6f4]">欢迎来购买</p>
                        <div aria-hidden="true" className="rounded-xl border border-[#2f3a4b] bg-[#111a27]/80 p-3">
                            <div className="h-2 w-2/3 rounded-full bg-[#44556d]" />
                            <div className="mt-2 h-2 w-1/2 rounded-full bg-[#36465c]" />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#222d3f] pt-6 text-xs text-[#63748b] md:flex-row md:items-center">
                    <p>2026 LDC 商店。非官方服务，仅用于演示与自部署。</p>
                    <div className="flex items-center gap-3">
                        <a href="https://github.com/chatgptuk/ldc-shop" target="_blank" rel="noreferrer" className="text-[#8ea2be] transition-colors hover:text-white">
                            v{version}
                        </a>
                        <span className="rounded-full border border-[#2c3748] bg-[#111a27] px-2.5 py-1 font-mono text-[10px] text-[#8da0ba]">
                            中文界面
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
