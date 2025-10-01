import { useState, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type Toast = ToastProps & {
  open: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, action, variant = "default" }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        title,
        description,
        action,
        variant,
        open: true,
      }

      setToasts((prevToasts) => [...prevToasts, newToast])

      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.map((t) => (t.id === id ? { ...t, open: false } : t))
        )
      }, 5000)

      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, 5500)

      return {
        id,
        dismiss: () => {
          setToasts((prevToasts) =>
            prevToasts.map((t) => (t.id === id ? { ...t, open: false } : t))
          )
        },
        update: (props: Partial<Omit<ToastProps, "id">>) => {
          setToasts((prevToasts) =>
            prevToasts.map((t) => (t.id === id ? { ...t, ...props } : t))
          )
        },
      }
    },
    []
  )

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      setToasts((prevToasts) =>
        prevToasts.map((t) =>
          toastId === undefined || t.id === toastId ? { ...t, open: false } : t
        )
      )
    },
  }
}
