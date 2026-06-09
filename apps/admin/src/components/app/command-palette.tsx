'use client'

import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon, DatabaseIcon, HomeIcon, KeyRoundIcon, PlusIcon, ScrollTextIcon, ShapesIcon, UsersIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Command,
    CommandCollection,
    CommandDialog,
    CommandDialogPopup,
    CommandEmpty,
    CommandFooter,
    CommandGroup,
    CommandGroupLabel,
    CommandInput,
    CommandItem,
    CommandList,
    CommandPanel,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useEntityCatalog } from '@/lib/hooks/use-entities'

export interface PaletteItem {
    value: string
    label: string
    shortcut?: string
    Icon: ComponentType<{ className?: string }>
    action: () => void
}

export interface PaletteGroup {
    value: string
    items: PaletteItem[]
}

type CommandPaletteProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const groupLabelClassName = 'px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]'

const commandItemClassName =
    'group/command-item gap-3 rounded-md px-3 py-2 text-foreground/85 data-highlighted:bg-foreground/[0.06] data-highlighted:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70'

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter()
    const { data: entities = [] } = useEntityCatalog()

    const runCommand = useCallback(
        (action: () => void) => {
            onOpenChange(false)
            action()
        },
        [onOpenChange],
    )

    const groupedItems = useMemo<PaletteGroup[]>(
        () => [
            {
                value: 'Navigation',
                items: [
                    {
                        value: 'home dashboard',
                        label: 'Home',
                        Icon: HomeIcon,
                        action: () => router.push('/'),
                    },
                    {
                        value: 'entities all',
                        label: 'Entities',
                        Icon: ShapesIcon,
                        action: () => router.push('/entities'),
                    },
                    {
                        value: 'audit log history',
                        label: 'Audit log',
                        Icon: ScrollTextIcon,
                        action: () => router.push('/audit-log'),
                    },
                    {
                        value: 'users members accounts user management',
                        label: 'Users',
                        Icon: UsersIcon,
                        action: () => router.push('/users'),
                    },
                    {
                        value: 'permissions roles access control matrix',
                        label: 'Permissions',
                        Icon: KeyRoundIcon,
                        action: () => router.push('/permissions'),
                    },
                ],
            },
            {
                value: 'Entities',
                items: entities.map((entity) => ({
                    value: `${entity.name} ${entity.slug} list browse`,
                    label: entity.name,
                    Icon: DatabaseIcon,
                    action: () => router.push(`/entities/${entity.slug}`),
                })),
            },
            {
                value: 'Create',
                items: [
                    {
                        value: 'create new user invite account',
                        label: 'New user',
                        Icon: UsersIcon,
                        action: () => router.push('/users/new'),
                    },
                    ...entities.map((entity) => ({
                        value: `create new ${entity.name} ${entity.slug}`,
                        label: `New ${entity.name}`,
                        Icon: PlusIcon,
                        action: () => router.push(`/entities/${entity.slug}/new`),
                    })),
                ],
            },
        ],
        [entities, router],
    )

    function handleItemClick(item: PaletteItem): void {
        runCommand(item.action)
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandDialogPopup>
                <Command
                    itemToStringValue={(item) => {
                        const paletteItem = item as PaletteItem
                        return `${paletteItem.label} ${paletteItem.value}`
                    }}
                    items={groupedItems}
                >
                    <CommandInput placeholder='Type a command or search…' />
                    <CommandPanel>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandList>
                            {(group: PaletteGroup) => (
                                <Fragment key={group.value}>
                                    <CommandGroup items={group.items}>
                                        <CommandGroupLabel className={groupLabelClassName}>{group.value}</CommandGroupLabel>
                                        <CommandCollection>
                                            {(item: PaletteItem) => (
                                                <CommandItem
                                                    className={commandItemClassName}
                                                    key={item.value}
                                                    onClick={() => handleItemClick(item)}
                                                    value={item.value}
                                                >
                                                    <item.Icon />
                                                    <span className='flex-1 text-sm truncate'>{item.label}</span>
                                                    {item.shortcut ?
                                                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                                                    :   null}
                                                </CommandItem>
                                            )}
                                        </CommandCollection>
                                    </CommandGroup>
                                    <CommandSeparator />
                                </Fragment>
                            )}
                        </CommandList>
                    </CommandPanel>
                    <CommandFooter>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <KbdGroup>
                                    <Kbd>
                                        <ArrowUpIcon />
                                    </Kbd>
                                    <Kbd>
                                        <ArrowDownIcon />
                                    </Kbd>
                                </KbdGroup>
                                <span>Navigate</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Kbd>
                                    <CornerDownLeftIcon />
                                </Kbd>
                                <span>Open</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Kbd>Esc</Kbd>
                            <span>Close</span>
                        </div>
                    </CommandFooter>
                </Command>
            </CommandDialogPopup>
        </CommandDialog>
    )
}

export function useCommandPalette(): {
    open: boolean
    setOpen: (open: boolean) => void
    toggle: () => void
} {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent): void {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpen((current) => !current)
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    return {
        open,
        setOpen,
        toggle: () => setOpen((current) => !current),
    }
}
