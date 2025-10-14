'use client'

import { useRef } from "react"
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
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  // Login mutation with TanStack Query
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      // Replace with your actual API call
      // Simulate API call with a delay for animation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock response - replace with actual API call
      if (credentials.email === "error@example.com") {
        throw new Error("Invalid email or password")
      }

      return { user: { id: "1", name: "User", email: credentials.email }, token: "dummy-token" }
    },
    onSuccess: (data) => {
      login(data.user, data.token)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      // Handle API errors
      if (error.message.includes('credentials')) {
        setError('root', { message: 'Invalid email or password' })
      } else if (error.message.includes('email')) {
        setError('email', { message: 'Email not found' })
        setFocus('email')
      } else if (error.message.includes('password')) {
        setError('password', { message: 'Incorrect password' })
        setFocus('password')
      } else {
        setError('root', { message: error.message || 'An error occurred' })
      }
    }
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data)
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
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
          <div className="flex items-center">
            <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
              Password
            </Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
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

        {/* Button with animation */}
        <div className="flex justify-center h-10 relative">
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-full"
            animate={{
              width: loginMutation.isPending || isSubmitting ? "48px" : "100%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              type="submit"
              className={cn(
                "w-full h-10",
                (loginMutation.isPending || isSubmitting) && "rounded-full !p-0"
              )}
              disabled={isSubmitting || loginMutation.isPending}
            >
              <AnimatePresence mode="wait">
                {(loginMutation.isPending || isSubmitting) ? (
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
                    Login
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Login with GitHub
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}