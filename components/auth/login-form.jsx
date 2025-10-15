'use client'

import { useState, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import SocialLogin from './social-login'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'

// ✅ Correct Zod schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)

  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'wowdash@gmail.com',
      password: 'Pa$$w0rd!',
    },
  })

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Login successful!')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email Field */}
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={methods.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="border border-neutral-500 w-4.5 h-4.5" />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-primary font-medium hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full rounded-lg h-[52px] text-sm mt-2" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Divider */}
        <div className="mt-8 relative text-center before:absolute before:w-full before:h-px before:bg-neutral-300 dark:before:bg-slate-600 before:top-1/2 before:left-0">
          <span className="relative z-10 px-4 bg-white dark:bg-slate-900 text-base">
            Or sign in with
          </span>
        </div>

        {/* Social Login */}
        <SocialLogin />

        {/* Signup Prompt */}
        <div className="mt-8 text-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </FormProvider>
  )
}

export default LoginForm