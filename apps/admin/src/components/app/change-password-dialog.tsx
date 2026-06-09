'use client'

import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { AdminUser } from '@/lib/types/entity'
import { Field, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'

type ChangePasswordDialogProps = {
    user: AdminUser | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (userId: string, password: string) => void
}

export function ChangePasswordDialog({ user, open, onOpenChange, onConfirm }: ChangePasswordDialogProps) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const mismatch = confirm.length > 0 && password !== confirm
    const canSubmit = password.length >= 8 && password === confirm

    function handleOpenChange(next: boolean) {
        if (!next) {
            setPassword('')
            setConfirm('')
        }
        onOpenChange(next)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogPopup className='max-w-md'>
                <DialogContent>
                    <DialogHeader>
                        <div className='flex items-start gap-3'>
                            <div className='flex justify-center items-center bg-foreground/[0.06] rounded-full size-9 text-foreground shrink-0'>
                                <KeyRoundIcon className='size-4' />
                            </div>
                            <div>
                                <DialogTitle>Change password</DialogTitle>
                                <DialogDescription className='mt-1'>Set a new password for {user?.name ?? 'this user'}. They will need to sign in again.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <Form>
                        <DialogPanel className='flex flex-col gap-4'>
                            <Field>
                                <FieldLabel htmlFor='new-password'>New password</FieldLabel>
                                <Input
                                    id='new-password'
                                    type='password'
                                    autoComplete='new-password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='At least 8 characters'
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor='confirm-password'>Confirm password</FieldLabel>
                                <Input
                                    id='confirm-password'
                                    type='password'
                                    autoComplete='new-password'
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder='Re-enter password'
                                    aria-invalid={mismatch}
                                />
                                {mismatch ?
                                    <p className='text-destructive text-xs'>Passwords do not match</p>
                                :   null}
                            </Field>
                        </DialogPanel>
                    </Form>
                    <DialogFooter>
                        <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
                        <Button
                            disabled={!canSubmit || !user}
                            onClick={() => {
                                if (!user || !canSubmit) return
                                onConfirm(user.id, password)
                                handleOpenChange(false)
                            }}>
                            Update password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPopup>
        </Dialog>
    )
}
