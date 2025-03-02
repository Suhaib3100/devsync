import { toast, type ExternalToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  return {
    toast: ({ title, description, action, variant }: ToastProps) => {
      const toastOptions: ExternalToast = {
        description,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      }

      // Map our variants to appropriate toast methods
      switch (variant) {
        case "destructive":
          toast.error(title, toastOptions)
          break
        case "success":
          toast.success(title, toastOptions)
          break
        case "warning":
          toast.warning(title, toastOptions)
          break
        case "info":
          toast.info(title, toastOptions)
          break
        default:
          toast(title, toastOptions)
      }
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