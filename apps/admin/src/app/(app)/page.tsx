'use client'

import { formatDistanceToNow } from 'date-fns'
import { ArrowRightIcon, DatabaseIcon, ScrollTextIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { PageHeader } from '@/components/app/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getEntityCatalog } from '@/lib/mock/entities'
import { countActionsToday, getRecentAuditEntries } from '@/lib/mock/audit-log'
import { countRecords, totalRecordCount } from '@/lib/mock/records'
import { getUser } from '@/lib/mock/users'

const ENTITY_GRADIENTS = ['from-emerald-400/40 to-teal-600/30', 'from-amber-300/40 to-orange-500/30', 'from-indigo-400/40 to-violet-600/30', 'from-rose-400/40 to-pink-600/30', 'from-cyan-400/40 to-blue-600/30', 'from-fuchsia-400/40 to-purple-600/30', 'from-yellow-300/40 to-amber-500/30', 'from-lime-400/40 to-green-600/30'];

export default function HomePage() {
    const entities = getEntityCatalog()
    const recentActivity = useMemo(() => getRecentAuditEntries(5), [])
    const stats = useMemo(
        () => ({
            totalRecords: totalRecordCount(),
            entityCount: entities.length,
            actionsToday: countActionsToday(),
        }),
        [entities.length],
    )

    const greeting = (() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    })()

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })

    return (
        <div className='px-10 py-10'>
            <div className='mx-auto'>
                <div className='font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]'>{today}</div>
                <h1 className='mt-1 font-heading text-4xl tracking-tight'>{greeting}, Sean.</h1>
                <p className='mt-2 max-w-xl text-muted-foreground text-sm'>Manage members, invoices, and customers from one place. Mock data — no API yet.</p>

                <div className='gap-3 grid grid-cols-3 mt-6'>
                    <StatTile label='Total records' value={String(stats.totalRecords)} />
                    <StatTile label='Entities' value={String(stats.entityCount)} />
                    <StatTile label='Actions today' value={String(stats.actionsToday)} />
                </div>

                <div className='mt-8'>
                    <PageHeader title='Entity shortcuts' description='Jump straight to an entity table.' />
                    <div className='gap-3 grid grid-cols-1 sm:grid-cols-3'>
                        {entities.map((entity, index) => (
                            <Link
                                key={entity.slug}
                                href={`/entities/${entity.slug}`}
                                className='group flex justify-between items-center gap-3 bg-background/40 hover:bg-background/60 px-4 py-3 border border-border/60 hover:border-foreground/40 rounded-lg transition-colors'>
                                <div className='flex items-center gap-3'>
                                    <div className={`flex size-9 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-border/60 ${ENTITY_GRADIENTS[index % ENTITY_GRADIENTS.length] ?? ''}`}>
                                        <DatabaseIcon className='size-4 text-foreground/70' />
                                    </div>
                                    <div>
                                        <div className='font-medium text-sm'>{entity.name}</div>
                                        <div className='text-muted-foreground text-xs'>{countRecords(entity.slug)} records</div>
                                    </div>
                                </div>
                                <ArrowRightIcon className='opacity-50 group-hover:opacity-90 size-3.5 transition-transform group-hover:translate-x-0.5' />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className='bg-card shadow-xs/5 mt-8 p-5 border border-border/60 rounded-xl'>
                    <div className='flex justify-between items-center gap-4'>
                        <div className='flex items-center gap-2'>
                            <ScrollTextIcon className='size-4 text-muted-foreground' />
                            <h2 className='font-heading text-base'>Recent activity</h2>
                        </div>
                        <Link href='/audit-log' className='text-muted-foreground hover:text-foreground text-sm transition-colors'>
                            View all
                            <ArrowRightIcon className='inline ml-1 size-4' />
                        </Link>
                    </div>
                    <ul className='flex flex-col gap-2 mt-4'>
                        {recentActivity.map((entry) => {
                            const actor = getUser(entry.actorId)
                            const entityName = entities.find((e) => e.slug === entry.entity)?.name ?? entry.entity
                            return (
                                <li key={entry.id} className='flex items-center gap-3 hover:bg-foreground/[0.03] px-2 py-2 rounded-md transition-colors'>
                                    <Avatar className='size-7'>
                                        <AvatarFallback className='text-[10px]'>{actor?.initials ?? '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex-1 min-w-0'>
                                        <span className='text-sm'>
                                            <span className='font-medium'>{actor?.name ?? 'Unknown'}</span> <span className='text-muted-foreground'>{entry.action}d</span>{' '}
                                            <Link href={`/entities/${entry.entity}/${entry.recordId}`} className='text-foreground hover:underline'>
                                                {entityName} · {entry.recordId}
                                            </Link>
                                        </span>
                                    </div>
                                    <span className='font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em] shrink-0'>
                                        {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <div className='bg-background/40 px-4 py-3 border border-border/60 rounded-lg'>
            <div className='font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]'>{label}</div>
            <div className='mt-1 font-heading tabular-nums text-2xl'>{value}</div>
        </div>
    )
}
