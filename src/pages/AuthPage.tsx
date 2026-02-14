import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Shield, ArrowLeft, Eye, EyeOff, Mail } from "lucide-react"
import { api } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"

type LoginType = "select" | "admin" | "influencer"

export default function AuthPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [loginType, setLoginType] = useState<LoginType>("select")
  
  // Admin state
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminError, setAdminError] = useState("")
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  
  // Influencer state
  const [influencerEmail, setInfluencerEmail] = useState("")
  const [influencerPassword, setInfluencerPassword] = useState("")
  const [showInfluencerPassword, setShowInfluencerPassword] = useState(false)
  const [isCheckingVerification, setIsCheckingVerification] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    isEmailVerified: boolean
    isPasswordSet: boolean
  } | null>(null)
  const [influencerError, setInfluencerError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [isInfluencerLoading, setIsInfluencerLoading] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError("")
    setIsAdminLoading(true)

    try {
      const response = await api.adminLogin(adminEmail, adminPassword)
      
      if (response.success && response.token && response.user) {
        setAuth(
          {
            ...response.user,
            type: "admin",
          },
          response.token
        )
        navigate("/admin/dashboard")
      } else {
        setAdminError(response.message || "Login failed")
      }
    } catch (err: any) {
      setAdminError(err.message || "Failed to login. Please try again.")
    } finally {
      setIsAdminLoading(false)
    }
  }

  const checkInfluencerVerification = async (email: string) => {
    setIsCheckingVerification(true)
    setInfluencerError("")
    setInfoMessage("")

    try {
      const response = await api.checkInfluencerVerification(email)
      
      if (response.success && response.exists) {
        setVerificationStatus({
          isEmailVerified: response.isEmailVerified,
          isPasswordSet: response.isPasswordSet,
        })
        
        if (!response.isEmailVerified) {
          setInfoMessage("Please check your email to verify your account first.")
        }
      } else {
        setInfluencerError("Email not found in the system")
        setVerificationStatus(null)
      }
    } catch (err: any) {
      setInfluencerError(err.message || "Failed to check verification status")
      setVerificationStatus(null)
    } finally {
      setIsCheckingVerification(false)
    }
  }

  const handleInfluencerEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfluencerError("")
    setInfoMessage("")

    if (!influencerEmail) {
      setInfluencerError("Please enter your email")
      return
    }

    // First check verification status
    await checkInfluencerVerification(influencerEmail)
  }

  const handleInfluencerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfluencerError("")
    setInfoMessage("")
    setIsInfluencerLoading(true)

    try {
      // If password is set and provided, include it in login
      const response = await api.influencerLogin(
        influencerEmail,
        verificationStatus?.isPasswordSet ? influencerPassword : undefined
      )

      if (response.success) {
        // If verification email was sent
        if (response.message?.includes("Verification email sent")) {
          setInfoMessage(response.message)
          // Redirect to verification page with email so user can enter token manually
          setTimeout(() => {
            navigate("/verify-email", { state: { email: influencerEmail } })
          }, 1500)
          return
        }

        // If login successful with token
        if (response.token && response.influencer) {
          setAuth(
            {
              ...response.influencer,
              type: "influencer",
            },
            response.token
          )
          navigate("/influencer/dashboard")
        } else {
          setInfluencerError(response.message || "Login failed")
        }
      } else {
        setInfluencerError(response.message || "Login failed")
      }
    } catch (err: any) {
      setInfluencerError(err.message || "Failed to login. Please try again.")
    } finally {
      setIsInfluencerLoading(false)
    }
  }

  // Reset influencer form when switching back
  const handleInfluencerBack = () => {
    setLoginType("select")
    setInfluencerEmail("")
    setInfluencerPassword("")
    setVerificationStatus(null)
    setInfluencerError("")
    setInfoMessage("")
  }

  // Reset admin form when switching back
  const handleAdminBack = () => {
    setLoginType("select")
    setAdminEmail("")
    setAdminPassword("")
    setAdminError("")
  }

  if (loginType === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-3 tracking-tight">
              Welcome to Karolina
            </h1>
            <p className="text-gray-500 text-base sm:text-lg font-light">
              Choose how you'd like to sign in
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {/* Admin Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:border-gray-300/80 hover:-translate-y-1"
              onClick={() => setLoginType("admin")}
            >
              <CardHeader className="text-center pb-6 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 group-hover:from-gray-800 group-hover:to-gray-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-medium text-gray-900 mb-2">Admin</CardTitle>
                <CardDescription className="text-sm text-gray-500 font-light">
                  Access the admin dashboard with full privileges
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Influencer Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:border-gray-300/80 hover:-translate-y-1"
              onClick={() => setLoginType("influencer")}
            >
              <CardHeader className="text-center pb-6 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:scale-110">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-medium text-gray-900 mb-2">Influencer</CardTitle>
                <CardDescription className="text-sm text-gray-500 font-light">
                  Access your influencer portal and manage your content
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loginType === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-2xl shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleAdminBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto mb-6 mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-light tracking-tight text-gray-900">Admin Login</CardTitle>
            <CardDescription className="text-sm text-gray-500 font-light pt-1">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              {adminError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {adminError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-0"
                    aria-label={showAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button 
                type="submit"
                disabled={isAdminLoading}
                className="w-full h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-200 disabled:opacity-50"
              >
                {isAdminLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loginType === "influencer") {
    // If verification status hasn't been checked yet, show email input
    if (!verificationStatus) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
          <Card className="w-full max-w-md shadow-2xl shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 h-9 w-9 rounded-full hover:bg-gray-100"
                onClick={handleInfluencerBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="mx-auto mb-6 mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-light tracking-tight text-gray-900">Influencer Login</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-light pt-1">
                Enter your email to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleInfluencerEmailSubmit} className="space-y-5">
                {influencerError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {influencerError}
                  </div>
                )}

                {infoMessage && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="influencer-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="influencer-email"
                    type="email"
                    placeholder="influencer@example.com"
                    value={influencerEmail}
                    onChange={(e) => setInfluencerEmail(e.target.value)}
                    required
                    disabled={isCheckingVerification}
                    className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900 disabled:opacity-50"
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isCheckingVerification}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {isCheckingVerification ? "Checking..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )
    }

    // If verified and password set, show login form with password
    if (verificationStatus.isEmailVerified && verificationStatus.isPasswordSet) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
          <Card className="w-full max-w-md shadow-2xl shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 h-9 w-9 rounded-full hover:bg-gray-100"
                onClick={handleInfluencerBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="mx-auto mb-6 mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-light tracking-tight text-gray-900">Influencer Login</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-light pt-1">
                Enter your password to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleInfluencerLogin} className="space-y-5">
                {influencerError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {influencerError}
                  </div>
                )}

                {infoMessage && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="influencer-email-display" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="influencer-email-display"
                    type="email"
                    value={influencerEmail}
                    disabled
                    className="h-12 bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="influencer-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="influencer-password"
                      type={showInfluencerPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={influencerPassword}
                      onChange={(e) => setInfluencerPassword(e.target.value)}
                      required
                      className="h-12 bg-white/50 border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 text-gray-900 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowInfluencerPassword(!showInfluencerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-0"
                      aria-label={showInfluencerPassword ? "Hide password" : "Show password"}
                    >
                      {showInfluencerPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isInfluencerLoading}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {isInfluencerLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )
    }

    // If not verified, show message and login button
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-2xl shadow-black/5 border border-gray-200/80 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleInfluencerBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto mb-6 mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-light tracking-tight text-gray-900">Verify Email</CardTitle>
            <CardDescription className="text-sm text-gray-500 font-light pt-1">
              Please verify your email first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {influencerError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {influencerError}
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{infoMessage || "A verification email will be sent to your inbox. Please check your email and verify your account."}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="influencer-email-display" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="influencer-email-display"
                type="email"
                value={influencerEmail}
                disabled
                className="h-12 bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
              />
            </div>

            <Button 
              type="button"
              onClick={handleInfluencerLogin}
              disabled={isInfluencerLoading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 disabled:opacity-50"
            >
              {isInfluencerLoading ? "Sending..." : "Send Verification Email"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
