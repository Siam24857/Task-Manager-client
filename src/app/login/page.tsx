"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Lock, Mail, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await api.post("/auth/login/", data)
      const { access, refresh, user } = response.data
      setAuth(user, access, refresh)
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      toast.success("Login successful!")
      router.push("/tasks")
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        "Login failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    "text-white placeholder-gray-500",
                    errors.email && "border-red-500"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    "text-white placeholder-gray-500",
                    errors.password && "border-red-500"
                  )}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 gradient-bg rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
