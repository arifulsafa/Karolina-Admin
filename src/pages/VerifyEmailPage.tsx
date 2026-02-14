import { useState } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  Eye, EyeOff, MailCheck } from "lucide-react"
import { api } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const token = searchParams.get("token")
  const state = (location.state || {}) as { email?: string }
  const [manualToken, setManualToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const effectiveToken = token || manualToken
    if (!effectiveToken) {
      setError("Verification token is required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.influencerVerifyEmail(effectiveToken, password)
      
      if (response.success && response.token && response.influencer) {
        // Login the user
        login(
          {
            ...response.influencer,
            type: "influencer",
          },
          response.token
        )

        // Navigate to influencer dashboard
        navigate("/influencer/dashboard")
      } else {
        setError(response.message || "Verification failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If token is not provided via URL, show form that includes token field
  const showManualTokenForm = !token

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-2xl shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-6 mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-light tracking-tight text-gray-900">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 font-light pt-1">
            Set your password to complete verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {state.email && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input disabled value={state.email} className="mt-1 bg-gray-50 border-gray-200 text-gray-600" />
              </div>
            )}

            {showManualTokenForm && (
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium text-gray-700">
                  Verification Token
                </Label>
                <Input
                  id="token"
                  placeholder="Paste your token here"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="h-12 bg-white/50 border-gray-200 focus:border-gray-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-0"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

