'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Github, Chrome } from 'lucide-react'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState({
    google: false,
    github: false
  })

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }))
      
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        toast.error(`Failed to sign in with ${provider}`)
      } else {
        toast.success(`Signing in with ${provider}...`)
        // The redirect will happen automatically if successful
      }
    } catch (error) {
      toast.error('Something went wrong with social login')
      console.error('Social login error:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className="flex gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-14 rounded-xl border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-neutral-50 dark:hover:bg-slate-700"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading.google}
      >
        {isLoading.google ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Chrome className="w-5 h-5" />
        )}
        <span className="ms-2">Google</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="flex-1 h-14 rounded-xl border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-neutral-50 dark:hover:bg-slate-700"
        onClick={() => handleSocialLogin('github')}
        disabled={isLoading.github}
      >
        {isLoading.github ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Github className="w-5 h-5" />
        )}
        <span className="ms-2">GitHub</span>
      </Button>
    </div>
  )
}

export default SocialLogin