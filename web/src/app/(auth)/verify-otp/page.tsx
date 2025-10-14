'use client'

import { useEffect, useState } from "react"
import { OTPVerificationForm } from "@/components/otp-verification-form"
import { GalleryVerticalEnd } from "lucide-react"

export default function VerifyOTPPage() {
    // Add client-side only rendering to prevent hydration errors
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Return null or a loading state during server-side rendering
    if (!isMounted) {
        return (
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        {/* Skeleton loader for logo */}
                        <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-center space-x-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-12 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                                    ))}
                                </div>
                                <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative hidden bg-muted lg:block"></div>
            </div>


        )
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Acme Inc.
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <OTPVerificationForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <p className="mt-4 ml-4 text-lg ">
                    This is the image that will be displayed on the right side of the login page.
                </p>
                <img
                    src="/auth.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}