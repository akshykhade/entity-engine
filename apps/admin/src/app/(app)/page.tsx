'use client'

import { ArrowRightIcon, DatabaseIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/app/page-header'
import { useEntityCatalog } from '@/lib/hooks/use-entities'
import { authClient } from '@/lib/auth/client'

const ENTITY_GRADIENTS = ['from-emerald-400/40 to-teal-600/30', 'from-amber-300/40 to-orange-500/30', 'from-indigo-400/40 to-violet-600/30', 'from-rose-400/40 to-pink-600/30', 'from-cyan-400/40 to-blue-600/30', 'from-fuchsia-400/40 to-purple-600/30', 'from-yellow-300/40 to-amber-500/30', 'from-lime-400/40 to-green-600/30'];

export default function HomePage() {
    const { data: entities = [], isLoading } = useEntityCatalog()
    const { data: session } = authClient.useSession()
    const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

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
                <h1 className='mt-1 font-heading text-4xl tracking-tight'>{greeting}, {firstName}.</h1>
                <p className='mt-2 max-w-xl text-muted-foreground text-sm'>
                    Manage server entities and users from the admin console.
                </p>

                <div className='mt-8'>
                    <PageHeader
                        title='Entity shortcuts'
                        description={
                            isLoading
                                ? 'Loading entities…'
                                : 'Jump straight to an entity table.'
                        }
                    />
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
                                        <div className='text-muted-foreground text-xs'>{entity.slug}</div>
                                    </div>
                                </div>
                                <ArrowRightIcon className='opacity-50 group-hover:opacity-90 size-3.5 transition-transform group-hover:translate-x-0.5' />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
