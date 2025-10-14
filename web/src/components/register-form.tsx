'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useMutation } from "@tanstack/react-query"
import { AlertCircle, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

// Define schema for form validation
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter()
  const { login } = useAuthStore()

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setFocus
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  // Register mutation with TanStack Query
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormValues) => {
      // Simulate API call with a delay for animation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock response - replace with actual API call
      if (userData.email === "exists@example.com") {
        throw new Error("email already exists")
      }

      return { user: { id: "1", name: userData.firstName, email: userData.email }, token: "dummy-token" }
    },
    onSuccess: (data) => {
      // login(data.user, data.token)
      router.push('/verify-otp')
    },
    onError: (error: Error) => {
      // Handle API errors
      if (error.message.includes('email already exists')) {
        setError('email', { message: 'This email is already registered' })
        setFocus('email')
      } else {
        setError('root', { message: error.message || 'Registration failed' })
      }
    }
  })

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data)
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign Up for an Account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to create a new account.
        </p>
      </div>

      <AnimatePresence>
        {errors.root && (
          <motion.div
            className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errors.root.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>
            First Name
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              {...register("firstName")}
              type="text"
              placeholder="Joe"
              className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.firstName}
            />
            <AnimatePresence>
              {errors.firstName && (
                <motion.div
                  className="absolute -bottom-5 left-0 text-xs font-medium text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.firstName.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>
            Last Name
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              {...register("lastName")}
              type="text"
              placeholder="Daniel"
              className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.lastName}
            />
            <AnimatePresence>
              {errors.lastName && (
                <motion.div
                  className="absolute -bottom-5 left-0 text-xs font-medium text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.lastName.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
            Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              {...register("email")}
              type="email"
              placeholder="m@example.com"
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.email}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  className="absolute -bottom-5 left-0 text-xs font-medium text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              {...register("password")}
              type="password"
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.password}
            />
            <AnimatePresence>
              {errors.password && (
                <motion.div
                  className="absolute -bottom-5 left-0 text-xs font-medium text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-destructive" : ""}>
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              {...register("confirmPassword")}
              type="password"
              className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.confirmPassword}
            />
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.div
                  className="absolute -bottom-5 left-0 text-xs font-medium text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.confirmPassword.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Button with animation */}
        <div className="flex justify-center h-10 relative">
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-full"
            animate={{
              width: registerMutation.isPending || isSubmitting ? "48px" : "100%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              type="submit"
              className={cn(
                "w-full h-10",
                (registerMutation.isPending || isSubmitting) && "rounded-full !p-0"
              )}
              disabled={isSubmitting || registerMutation.isPending}
            >
              <AnimatePresence mode="wait">
                {(registerMutation.isPending || isSubmitting) ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Register
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button variant="outline" className="w-full" type="button">
          <svg viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className="h-4 w-4 mr-2">
            <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path>
            <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path>
            <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path>
            <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path>
          </svg>
          Register with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  )
}