import { toast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  return {
    toast: ({ title, description, action }: ToastProps) => {
      toast(title, {
        description,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      })
    },
    dismiss: toast.dismiss,
    error: toast.error,
    success: toast.success,
    info: toast.info,
    warning: toast.warning,
    promise: toast.promise,
    custom: toast,
  }
}