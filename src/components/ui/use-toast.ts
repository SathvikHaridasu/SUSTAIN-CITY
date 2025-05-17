
import { toast as sonnerToast } from "sonner";
import { useToast as useShadcnToast, ToastActionElement, ToastProps } from "@/hooks/use-toast";

type Toast = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: ToastActionElement;
};

export const toast = (props: Toast) => {
  const { title, description, variant, duration, action } = props;
  
  // Use sonner toast for simpler notifications
  if (variant === "destructive") {
    sonnerToast.error(title, {
      description,
      duration: duration || 5000,
    });
  } else {
    sonnerToast(title, {
      description,
      duration: duration || 3000,
    });
  }
  
  // Also use shadcn toast for more complex notifications with actions
  if (action) {
    const { toast: shadcnToast } = useShadcnToast();
    shadcnToast({
      title,
      description,
      variant,
      duration,
      action,
    });
  }
};

// Re-export the useToast hook from shadcn
export const useToast = useShadcnToast;
