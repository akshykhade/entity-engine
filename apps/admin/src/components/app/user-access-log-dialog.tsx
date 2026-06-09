'use client'

import { format } from 'date-fns'
import { ScrollTextIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listAccessLogForUser } from '@/lib/mock/users'
import type { AccessLogEvent, AdminUser } from '@/lib/types/entity'

const EVENT_LABELS: Record<AccessLogEvent, string> = {
    login: 'Login',
    logout: 'Logout',
    failed_login: 'Failed login',
    password_change: 'Password change',
    impersonation: 'Impersonation',
}

const EVENT_BADGE: Record<AccessLogEvent, string> = {
    login: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    logout: 'border-muted-foreground/30 text-muted-foreground',
    failed_login: 'border-destructive/30 text-destructive',
    password_change: 'border-amber-500/30 text-amber-700 dark:text-amber-400',
    impersonation: 'border-violet-500/30 text-violet-700 dark:text-violet-400',
}

type UserAccessLogDialogProps = {
    user: AdminUser | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserAccessLogDialog({ user, open, onOpenChange }: UserAccessLogDialogProps) {
    const entries = useMemo(() => (user ? listAccessLogForUser(user.id) : []), [user])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup className='max-w-2xl'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <div className='flex justify-center items-center bg-foreground/[0.06] rounded-full size-9 text-foreground shrink-0'>
                            <ScrollTextIcon className='size-4' />
                        </div>
                        <div>
                            <DialogTitle>Access log</DialogTitle>
                            <p className='mt-1 text-muted-foreground text-sm'>
                                Sign-in history for {user?.name ?? 'user'} · {entries.length} events · mock data
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <DialogPanel>
                    {entries.length === 0 ?
                        <div className='py-10 text-muted-foreground text-sm text-center'>No access events recorded for this user.</div>
                    :   <div className='border rounded-lg max-h-[min(60vh,420px)] overflow-y-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='ps-4'>Event</TableHead>
                                        <TableHead>When</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className='pe-4'>Client</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className='ps-4'>
                                                <Badge variant='outline' size='sm' className={EVENT_BADGE[entry.event]}>
                                                    {EVENT_LABELS[entry.event]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>{format(entry.createdAt, 'MMM d, yyyy · h:mm a')}</TableCell>
                                            <TableCell className='font-mono text-xs'>{entry.ip}</TableCell>
                                            <TableCell className='text-muted-foreground text-xs'>{entry.location ?? '—'}</TableCell>
                                            <TableCell className='pe-4 text-muted-foreground text-xs'>{entry.userAgent}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    }
                </DialogPanel>
            </DialogPopup>
        </Dialog>
    )
}
