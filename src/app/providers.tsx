"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
      <Toaster 
        position="top-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'glass border border-border rounded-xl p-4 shadow-lg backdrop-blur-md w-full max-w-md',
            title: 'text-sm font-semibold',
            description: 'text-xs text-secondary-text mt-1',
            actionButton: 'px-3 py-1.5 rounded-lg bg-gradient-to-r from-tw-primary to-tw-secondary text-sm font-medium',
            cancelButton: 'px-3 py-1.5 rounded-lg glass text-sm',
            closeButton: 'glass rounded-lg border border-border hover:bg-white/10',
            success: 'border-green-500/30 bg-green-500/5',
            error: 'border-red-500/30 bg-red-500/5',
            warning: 'border-yellow-500/30 bg-yellow-500/5',
            info: 'border-blue-500/30 bg-blue-500/5',
          },
        }}
      />
    </ThirdwebProvider>
  );
}
