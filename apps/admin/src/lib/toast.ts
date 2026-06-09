import type { AppToastAction, AppToastVariant } from "@/components/app/app-toast";
import { toastManager } from "@/components/ui/toast";

export type ToastAction = Pick<AppToastAction, "label" | "variant" | "primary" | "onClick">;

export type ToastOptions = {
  description?: string;
  duration?: number;
  id?: string;
  action?: ToastAction;
  actions?: ToastAction[];
};

function show(
  variant: AppToastVariant,
  title: string,
  options?: ToastOptions,
): string {
  const { description, duration = 5000, id, action, actions } = options ?? {};
  const resolvedActions = actions ?? (action ? [action] : undefined);

  return toastManager.add({
    id,
    type: variant,
    title,
    description,
    timeout: duration,
    data: resolvedActions ? { actions: resolvedActions } : undefined,
  });
}

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    show("success", title, options),
  warning: (title: string, options?: ToastOptions) =>
    show("warning", title, options),
  info: (title: string, options?: ToastOptions) =>
    show("info", title, options),
  error: (title: string, options?: ToastOptions) =>
    show("error", title, options),
  dismiss: (id?: string) => toastManager.close(id),
};
