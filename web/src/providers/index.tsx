// components/providers/providers.tsx
'use client'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as NextThemesProvider } from 'next-themes' // Change the import
import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <QueryProvider >
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
    )
}