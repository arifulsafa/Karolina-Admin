import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Shield } from "lucide-react"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-gray-500 font-light">
              {user?.type === "admin" ? "Admin Dashboard" : "Influencer Portal"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
                {user?.type === "admin" ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{user?.email}</p>
              </div>
              {user?.firstName && (
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              )}
              {user?.influencerCode && (
                <div>
                  <p className="text-sm text-gray-500">Influencer Code</p>
                  <p className="text-base font-medium text-gray-900">{user.influencerCode}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="text-base font-medium text-gray-900 capitalize">{user?.type}</p>
              </div>
            </CardContent>
          </Card>

          {user?.type === "influencer" && (
            <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Installs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {user.totalInstalls || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Conversions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {user.totalConversions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${user.totalRevenue || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {user.conversionRate || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

