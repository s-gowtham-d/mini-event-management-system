'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Providers } from '@/providers'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    // Get current pathname
    const pathname = window.location.pathname

    // Check if current route is an auth route
    const isAuthRoute = ['/login', '/register', '/verify-otp', '/forgot-password'].some(route =>
      pathname.includes(route)
    )

    // If user is authenticated and trying to access auth routes,
    // redirect to dashboard or home
    if (isAuthenticated && isAuthRoute) {
      logout();
      router.push('/dashboard')
    }
  }, [router, isAuthenticated])

  return (


    <Providers>
      <div className="h-full">
        {children}
      </div>
    </Providers>
  )
}