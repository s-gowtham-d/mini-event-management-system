"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Schema that only validates on submit
const FormSchema = z.object({
  pin: z
    .string()
    .regex(/^\d*$/, "Only numbers are allowed")
    .length(6, "Your verification code must be 6 digits."),
})

export function OTPVerificationForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
    mode: "onSubmit", // Only validate on submit
  })

  // Watch the pin value to trigger auto-submit when 6 digits are entered
  const pinValue = form.watch("pin")

  useEffect(() => {
    if (pinValue?.length === 6) {
      // Small delay to ensure UI updates before submission
      setTimeout(() => {
        form.handleSubmit(onSubmit)()
      }, 100)
    }
  }, [pinValue])

  // Reset validation states when pin changes
  useEffect(() => {
    if (pinValue?.length > 0) {
      setIsInvalid(false)
      setIsSuccess(false)

      // Clear any existing errors when typing
      form.clearErrors()
    }
  }, [pinValue, form])

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check against dummy OTP
      if (data.pin !== "123456") {
        throw new Error("Invalid verification code")
      }

      return { user: { id: "1", name: "User" }, token: "dummy-token" }
    },
    onSuccess: (data) => {
      setIsSuccess(true)

      toast({
        title: "Verification successful",
        description: "Your account has been verified.",
      })

      // Delay redirect to show success state
      setTimeout(() => {
        // Log the user in and redirect
        // login(data.user, data.token)
        // Simulate login
        toast({
          title: "Logged in",
        })

        router.push('/dashboard')
      }, 1500)
    },
    onError: (error: Error) => {
      setIsInvalid(true)

      if (error.message.includes('expired')) {
        form.setError('pin', { message: 'This code has expired. Please request a new one.' })
      } else if (error.message.includes('invalid')) {
        form.setError('pin', { message: 'Invalid verification code. Please try again.' })
      } else {
        form.setError('root', { message: error.message || 'Verification failed' })
      }
    }
  })

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your phone.",
      })

      // Reset form
      form.reset()
      setIsInvalid(false)
      setIsSuccess(false)

      // Disable resend button for 60 seconds
      setResendDisabled(true)
      setCountdown(60)

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send a new code",
        variant: "destructive",
      })
    }
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Only submit if we have exactly 6 digits
    if (data.pin.length === 6) {
      verifyMutation.mutate(data)
    }
  }

  function handleResendCode() {
    resendMutation.mutate()
  }

  // Custom slot component to handle success/error states
  const CustomSlot = ({ index, ...props }: { index: number }) => {
    return (
      <InputOTPSlot
        index={index}
        {...props}
        className={cn(
          // Default styles
          "transition-all duration-200 h-14 w-14 text-xl", // Increased size
          // Success state
          isSuccess && "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30",
          // Error state
          isInvalid && "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/30"
        )}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Verify Your Account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter the 6-digit code sent to your phone number.
          </p>
        </div>

        <AnimatePresence>
          {form.formState.errors.root && (
            <motion.div
              className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{form.formState.errors.root.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6"> {/* Increased spacing between form elements */}
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel className="text-center text-base">Verification Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      pattern="\d*"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        // Only allow numbers, backspace, tab, and arrow keys
                        if (
                          !/^\d$/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Tab' &&
                          e.key !== 'ArrowLeft' &&
                          e.key !== 'ArrowRight' &&
                          e.key !== 'Delete'
                        ) {
                          e.preventDefault()
                        }
                      }}
                      className="gap-3" // Increased gap between inputs
                    >
                      <InputOTPGroup> {/* Increased gap */}
                        <CustomSlot index={0} />
                        <CustomSlot index={1} />
                        <CustomSlot index={2} />
                        <CustomSlot index={3} />
                        <CustomSlot index={4} />
                        <CustomSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>

                    {/* Success indicator */}
                    <AnimatePresence>
                      {isSuccess && (
                        <motion.div
                          className="absolute -right-10 top-1/2 -translate-y-1/2" // Adjusted position
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" /> {/* Larger icon */}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FormControl>
                <FormDescription className="text-center text-sm mt-2"> {/* Larger description */}
                  Please enter the verification code sent to your phone.
                </FormDescription>
                <FormMessage className="text-sm" /> {/* Larger error message */}
              </FormItem>
            )}
          />

          {/* Button container with fixed height to prevent layout shifts */}
          <div className="flex justify-center h-12 relative">
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-full" // Center the button
              animate={{
                width: verifyMutation.isPending ? "48px" : "100%",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base",
                  verifyMutation.isPending && "rounded-full !p-0"
                )}
                disabled={
                  form.formState.isSubmitting ||
                  verifyMutation.isPending ||
                  isSuccess ||
                  pinValue?.length !== 6
                }
              >
                <AnimatePresence mode="wait">
                  {verifyMutation.isPending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      Verified!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      Verify
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>

          {/* Resend button with increased margin-top */}
          <div className="text-center mt-8"> {/* Increased margin-top */}
            <Button
              type="button"
              variant="link"
              className="text-sm" // Larger text
              onClick={handleResendCode}
              disabled={resendDisabled || resendMutation.isPending || isSuccess}
            >
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : resendMutation.isPending
                  ? "Sending..."
                  : "Didn't receive a code? Resend"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}