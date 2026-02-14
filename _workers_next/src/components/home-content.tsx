"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { StarRatingStatic } from "@/components/star-rating-static"
import { useI18n } from "@/lib/i18n/context"
import { INFINITE_STOCK } from "@/lib/constants"
import {    ChevronLeft,
    ChevronRight,
    Filter,
    PackageOpen,
    Search,
    Sparkles,
} from "lucide-react"

interface Product {
    id: string
    name: string
    description: string | null
    descriptionPlain?: string | null
    price: string
    compareAtPrice?: string | null
    image: string | null
    category: string | null
    stockCount: number
    soldCount: number
    isHot?: boolean | null
    rating?: number
    reviewCount?: number
}

interface HomeContentProps {
    products: Product[]
    announcement?: string | null
    visitorCount?: number
    categories?: string[]
    categoryConfig?: Array<{ name: string; icon: string | null; sortOrder: number }>
    pendingOrders?: Array<{ orderId: string; createdAt: Date; productName: string; amount: string }>
    wishlistEnabled?: boolean
    filters: { q?: string; category?: string | null; sort?: string }
    pagination: { page: number; pageSize: number; total: number }
}

export function HomeContent({ products, announcement, visitorCount, categories = [], categoryConfig, pendingOrders, wishlistEnabled = false, filters, pagination }: HomeContentProps) {
    const { t } = useI18n()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(filters.category || null)
    const [searchTerm, setSearchTerm] = useState(filters.q || "")
    const [page, setPage] = useState(pagination.page || 1)
    const categoriesScrollerRef = useRef<HTMLDivElement | null>(null)
    const deferredSearch = useDeferredValue(searchTerm)

    useEffect(() => {
        setPage(1)
    }, [selectedCategory, deferredSearch])

    const filteredProducts = useMemo(() => {
        const keyword = deferredSearch.trim().toLowerCase()

        return products.filter((product) => {
            if (selectedCategory && product.category !== selectedCategory) return false

            if (!keyword) return true
            const name = (product.name || "").toLowerCase()
            const desc = (product.descriptionPlain || product.description || "").toLowerCase()
            return name.includes(keyword) || desc.includes(keyword)
        })
    }, [products, selectedCategory, deferredSearch])

    const sortedProducts = filteredProducts

    const categoryCards = useMemo(
        () => [
            { key: null as string | null, label: t("common.all"), icon: "#" },
            ...categories.map((name, idx) => ({
                key: name,
                label: name,
                icon: (categoryConfig?.find((c) => c.name === name)?.icon || ["+", "*", "=", "~", "@", "%"][idx % 6]).slice(0, 2),
            })),
        ],
        [categories, categoryConfig, t]
    )
    const showCategoryRail = categoryCards.length > 1

    const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pagination.pageSize))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const startIndex = (currentPage - 1) * pagination.pageSize
    const pageItems = sortedProducts.slice(startIndex, startIndex + pagination.pageSize)
    const hasMore = currentPage < totalPages

    return (
        <main className="container relative overflow-hidden py-8 md:py-12">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-56 left-1/2 h-[26rem] w-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(225,29,46,0.2),rgba(225,29,46,0))] blur-3xl" />
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(to_top,rgba(8,11,17,0.9),rgba(8,11,17,0))]" />
                <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:26px_26px]" />
            </div>

            {announcement && (
                <section className="mb-8">
                    <div className="relative overflow-hidden rounded-2xl border border-[#28303d] bg-[#121822]/85 p-4 backdrop-blur-md">
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#e11d2e]" />
                        <div className="flex items-start gap-3 pl-3">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#ff4b57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#dbe6f5]">{announcement}</p>
                        </div>
                    </div>
                </section>
            )}

            {pendingOrders && pendingOrders.length > 0 && (
                <section className="mb-8">
                    <div className="relative overflow-hidden rounded-2xl border border-yellow-500/25 bg-[#121822]/90 p-4">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-500 to-yellow-500/50" />
                        <div className="flex items-center justify-between gap-4 pl-3">
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium text-[#dbe6f5]">
                                    {pendingOrders.length === 1
                                        ? t("home.pendingOrder.single", { orderId: pendingOrders[0].orderId })
                                        : t("home.pendingOrder.multiple", { count: pendingOrders.length })}
                                </p>
                            </div>
                            <Link href={pendingOrders.length === 1 ? `/order/${pendingOrders[0].orderId}` : "/orders"}>
                                <Button size="sm" variant="outline" className="cursor-pointer border-yellow-500/30 bg-[#1a2230] text-[#f7f1c8] hover:bg-yellow-500/10 hover:text-yellow-300">
                                    {pendingOrders.length === 1 ? t("common.payNow") : t("common.viewOrders")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {showCategoryRail ? (
            <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-white">{t("common.categories")}</h2>
                    <div className="hidden items-center gap-2 md:flex">
                        <button
                            type="button"
                            onClick={() => categoriesScrollerRef.current?.scrollBy({ left: -420, behavior: "smooth" })}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a3342] bg-[#121822] text-[#a4b0c3] transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => categoriesScrollerRef.current?.scrollBy({ left: 420, behavior: "smooth" })}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a3342] bg-[#121822] text-[#a4b0c3] transition-colors hover:text-white"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div
                    ref={categoriesScrollerRef}
                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-color:#2a3444_transparent] [scrollbar-width:thin]"
                >
                    {categoryCards.map((item) => {
                        const active = selectedCategory === item.key
                        return (
                            <button
                                key={item.key || "all"}
                                type="button"
                                onClick={() => setSelectedCategory(item.key)}
                                className={cn(
                                    "group relative flex h-40 min-w-[176px] snap-start flex-col items-center justify-center overflow-hidden rounded-[24px] border bg-[#121822]/90 p-6 text-center transition-all duration-300",
                                    active
                                        ? "border-[#e11d2e66] shadow-[0_0_30px_rgba(225,29,46,0.25)]"
                                        : "border-[#273243] hover:border-[#e11d2e55] hover:bg-[#161d28]"
                                )}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(225,29,46,0.12),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className={cn("mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-lg font-semibold", active ? "border-[#e11d2e66] bg-[#3a1319] text-[#ff4b57]" : "border-[#2f3948] bg-[#1a2230] text-[#9aa8bd]")}>{item.icon}</div>
                                <span className={cn("relative z-10 text-base font-medium", active ? "text-white" : "text-[#c5cfdf]")}>{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </section>
            ) : null}

            <section className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="h-fit lg:sticky lg:top-24">
                    <div className="rounded-[24px] border border-[#2d3747] bg-[#1c2532] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-[#dce6f4]">小店营业中 🟢</h3>
                            <span className="rounded-full border border-[#2f4b3a] bg-[#1f2d26] px-2 py-0.5 text-[11px] text-[#8ef1b5]">在线</span>
                        </div>
                        <p className="mt-4 text-base font-medium leading-relaxed text-[#e7eef9]">欢迎光临！目前一切运行正常。</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-[#95a6bb]">
                            <span className="relative inline-flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            </span>
                            <span>一切运行正常</span>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-display text-4xl font-bold tracking-tight text-white">发现商品</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#9eacbf]">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#e11d2e] shadow-[0_0_12px_rgba(225,29,46,0.8)]" />
                                    实时库存
                                </span>
                                {typeof visitorCount === "number" ? (
                                    <>
                                        <span className="text-[#485567]">|</span>
                                        <span>{t("home.visitorCount", { count: visitorCount })}</span>
                                    </>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2a3444] bg-[#121923] p-1 text-xs">
                            <span className="rounded-xl bg-[#1f2937] px-4 py-2 font-medium text-white">推荐序</span>
                            <span className="rounded-xl px-4 py-2 font-medium text-[#8fa0b5]">最新序</span>
                            <span className="rounded-xl px-4 py-2 font-medium text-[#8fa0b5]">价格序</span>
                        </div>
                    </div>

                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#273243] bg-[#121822]/90 p-2.5">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78879b]" />
                            <Input
                                placeholder={t("common.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 rounded-xl border-[#2f3a4a] bg-[#1a2230] pl-9 text-white placeholder:text-[#6f7d91]"
                            />
                        </div>
                        <Badge className="rounded-full border border-[#2e3a4b] bg-[#1a2230] px-3 py-1 text-xs font-medium text-[#bcc9da]">
                            <Filter className="mr-1.5 h-3.5 w-3.5" />
                            {sortedProducts.length} 件
                        </Badge>
                    </div>

                    {sortedProducts.length === 0 ? (
                        <div className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden rounded-[34px] border border-dashed border-[#2a3444] bg-[#101722]/80 p-10 text-center">
                            <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(225,29,46,0.35),rgba(225,29,46,0))]" />
                            <div className="relative mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-[#e11d2e66] bg-[#2f1118] text-[#ff5967]">
                                <PackageOpen className="h-10 w-10" />
                            </div>
                            <h3 className="font-display text-5xl font-bold tracking-tight text-white">这里暂时没有商品</h3>
                            <p className="mt-5 max-w-xl text-xl leading-relaxed text-[#a4b1c4]">
                                该分类当前没有库存。你可以先浏览热门商品，或者稍后再回来看看。
                            </p>
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                <span className="inline-flex h-11 items-center rounded-full bg-[#e11d2e] px-7 text-sm font-semibold text-white">精选陈列</span>
                                <span className="inline-flex h-11 items-center rounded-full border border-[#2c3646] bg-[#1a2230] px-7 text-sm text-[#ccd7e6]">静态展示</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {pageItems.map((product, index) => (
                                <article
                                    key={product.id}
                                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#2a3444] bg-[#121a25]/92 transition-all duration-300 hover:-translate-y-1 hover:border-[#e11d2e66] hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    <Link href={`/buy/${product.id}`} className="absolute inset-0 z-20" aria-label={t("common.viewDetails")} />
                                    <div className="relative m-4 aspect-[16/10] overflow-hidden rounded-2xl border border-[#2f3a4b] bg-[#0f1520]">
                                        <Image
                                            src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            priority={index < 3}
                                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {product.category ? (
                                            <Badge className="absolute right-2 top-2 rounded-full border border-[#3b4658] bg-[#161f2d] px-2.5 py-1 text-[10px] font-medium capitalize text-[#ced9ea]">
                                                {product.category}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-1 flex-col px-5 pb-5">
                                        <div className="flex items-start gap-3">
                                            <h3 className="pointer-events-none line-clamp-1 font-display text-xl font-semibold tracking-tight text-white">
                                                {product.name}
                                            </h3>
                                            {product.isHot ? (
                                                <span className="mt-1 inline-flex items-center rounded-full border border-[#f43f5e55] bg-[#f43f5e1a] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#ff6b7f]">
                                                    热门
                                                </span>
                                            ) : null}
                                        </div>
                                        {product.reviewCount !== undefined && product.reviewCount > 0 ? (
                                            <div className="mt-2 flex items-center gap-2">
                                                <StarRatingStatic rating={Math.round(product.rating || 0)} size="xs" />
                                                <span className="text-xs text-[#8ea0b5]">({product.reviewCount})</span>
                                            </div>
                                        ) : null}
                                        <p className="pointer-events-none mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-[#9baac0]">
                                            {product.descriptionPlain || product.description || t("buy.noDescription")}
                                        </p>

                                        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                                            <div className="pointer-events-none">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black tracking-tight text-[#ff4b57]">{Number(product.price)}</span>
                                                    <span className="text-xs uppercase text-[#8fa1b8]">{t("common.credits")}</span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-[#8797ae]">
                                                    <span>{t("common.stock")}: {product.stockCount >= INFINITE_STOCK ? "无限" : product.stockCount}</span>
                                                    <span className="text-[#445064]">|</span>
                                                    <span>{t("common.sold")}: {product.soldCount}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={product.stockCount <= 0}
                                                className={cn(
                                                    "pointer-events-none relative z-10 h-10 rounded-full px-5 text-xs font-semibold",
                                                    product.stockCount > 0
                                                        ? "bg-[#e11d2e] text-white hover:bg-[#c71627]"
                                                        : "bg-[#222c3a] text-[#8393aa]"
                                                )}
                                            >
                                                {product.stockCount > 0 ? t("common.buy") : t("common.outOfStock")}
                                            </Button>
                                        </div>
                                    </div>

                                    {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) ? (
                                        <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center rounded-full bg-[#e11d2e] px-2 py-1 text-[10px] font-semibold text-white">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            优惠
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    )}

                    {sortedProducts.length > 0 ? (
                        <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-[#273243] bg-[#121822]/75 px-4 py-3 text-sm text-[#9eacc0]">
                            <span>{t("search.page", { page: currentPage, totalPages })}</span>
                            {hasMore ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPage(currentPage + 1)}
                                    className="h-9 rounded-full border-[#2d3748] bg-[#1a2230] px-4 text-xs text-[#d9e4f4] hover:bg-[#232d3f]"
                                >
                                    {t("common.loadMore")}
                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            ) : (
                                <span className="text-xs text-[#6f8096]">已经到底了</span>
                            )}
                        </div>
                    ) : null}
                </div>
            </section>
        </main>
    )
}





