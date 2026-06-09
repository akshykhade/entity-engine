import { AlertCircleIcon, CheckIcon, InfoIcon, TriangleAlertIcon, XIcon, type LucideIcon } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppToastVariant = 'success' | 'warning' | 'info' | 'error'

export type AppToastAction = {
    label: React.ReactNode
    variant?: 'ghost' | 'outline' | 'default'
    icon?: LucideIcon
    primary?: boolean
    onClick?: () => void
}

const VARIANT_CONFIG: Record<AppToastVariant, { icon: LucideIcon; badgeClassName: string; borderClassName: string; statusBadgeClassName: string }> = {
    success: {
        icon: CheckIcon,
        badgeClassName: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        borderClassName: 'border-emerald-500/40',
        statusBadgeClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    warning: {
        icon: TriangleAlertIcon,
        badgeClassName: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        borderClassName: 'border-amber-500/40',
        statusBadgeClassName: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    info: {
        icon: InfoIcon,
        badgeClassName: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        borderClassName: 'border-sky-500/40',
        statusBadgeClassName: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    error: {
        icon: AlertCircleIcon,
        badgeClassName: 'bg-destructive/15 text-destructive',
        borderClassName: 'border-destructive/40',
        statusBadgeClassName: 'bg-destructive/10 text-destructive',
    },
}

function resolveActionVariant(action: AppToastAction): 'ghost' | 'outline' | 'default' {
    if (action.variant) return action.variant
    return action.primary ? 'default' : 'ghost'
}

export type AppToastProps = {
    variant: AppToastVariant
    title: React.ReactNode
    description?: React.ReactNode
    badge?: React.ReactNode
    className?: string
    closeButton?: React.ReactNode
    actions?: AppToastAction[]
    /** Custom footer slot — used when toast actions need primitive wrappers (e.g. Toast.Action). */
    action?: React.ReactNode
}

export function AppToast({ variant, title, description, badge, className, closeButton, actions, action }: AppToastProps) {
    const { icon: Icon, badgeClassName, borderClassName, statusBadgeClassName } = VARIANT_CONFIG[variant]
    const hasFooter = (actions && actions.length > 0) || action

    return (
        <div className={cn('rounded-lg border bg-background shadow-lg', borderClassName, className)}>
            <div className='flex items-start gap-3 p-3.5'>
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', badgeClassName)}>
                    <Icon className='size-4' />
                </span>
                <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                        <div className='font-medium text-sm [&_h2]:font-medium [&_h2]:text-sm'>{title}</div>
                        {badge ?
                            <span className={cn('rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]', statusBadgeClassName)}>{badge}</span>
                        :   null}
                    </div>
                    {description ?
                        <div className='mt-1 text-muted-foreground text-xs leading-relaxed [&_p]:m-0'>{description}</div>
                    :   null}
                </div>
                {closeButton ?? (
                    <button
                        type='button'
                        aria-label='Close'
                        className='rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground'
                    >
                        <XIcon className='size-3.5' />
                    </button>
                )}
            </div>
            {hasFooter ?
                <div className='flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2'>
                    {actions?.map((item, index) => {
                        const ActionIcon = item.icon
                        return (
                            <Button key={index} size='sm' variant={resolveActionVariant(item)} type='button' onClick={item.onClick}>
                                {ActionIcon ?
                                    <ActionIcon />
                                :   null}
                                {item.label}
                            </Button>
                        )
                    })}
                    {action}
                </div>
            :   null}
        </div>
    )
}
