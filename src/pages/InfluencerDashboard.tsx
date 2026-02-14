import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, User, BarChart3, Mail, TrendingUp, Users, Activity, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { api, type InfluencerInstall, type InfluencerConversion } from "@/lib/api/api"

type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  { id: "overview", label: "Overview", icon: <Activity className="h-5 w-5" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { id: "audience", label: "Audience", icon: <Users className="h-5 w-5" /> },
]

export default function InfluencerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Analytics state
  const [stats, setStats] = useState<{
    totalInstalls: number
    totalConversions: number
    totalRevenue: number
    conversionRate: number
    feePercentage: number
    totalPayout?: number
    installsByPlatform: Array<{ platform: string; count: number }>
    installsByRegion: Array<{ region: string; count: number }>
    conversionsBySubscription: Array<{ subscription: string; count: number }>
    dailyInstalls: Array<{ date: string; count: number }>
    dailyConversions: Array<{ date: string; count: number }>
  } | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState("")
  const [installs, setInstalls] = useState<InfluencerInstall[]>([])
  const [isLoadingInstalls, setIsLoadingInstalls] = useState(false)
  const [installsError, setInstallsError] = useState("")
  const [conversions, setConversions] = useState<InfluencerConversion[]>([])
  const [isLoadingConversions, setIsLoadingConversions] = useState(false)
  const [conversionsError, setConversionsError] = useState("")
  // Audience tab pagination state
  const [audienceConversions, setAudienceConversions] = useState<InfluencerConversion[]>([])
  const [audiencePagination, setAudiencePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })
  const [audiencePage, setAudiencePage] = useState(1)
  const [isLoadingAudience, setIsLoadingAudience] = useState(false)
  const [audienceError, setAudienceError] = useState("")

  const handleLogout = () => {
    logout()
    navigate("/auth")
  }

  if (!user || user.type !== "influencer") {
    return null
  }

  // Fetch stats when switching to Overview or Analytics (with cache until reload)
  useEffect(() => {
    if ((activeMenu !== "overview" && activeMenu !== "analytics") || stats) return
    let isCancelled = false
    const fetchStats = async () => {
      setIsLoadingStats(true)
      setStatsError("")
      try {
        const res = await api.getInfluencerStats()
        if (!isCancelled) {
          if (res.success) setStats(res.stats)
          else setStatsError("Failed to load stats")
        }
      } catch (err: any) {
        if (!isCancelled) setStatsError(err.message || "Failed to load stats")
      } finally {
        if (!isCancelled) setIsLoadingStats(false)
      }
    }
    fetchStats()
    return () => { isCancelled = true }
  }, [activeMenu, stats])

  // Fetch installs when switching to Analytics (with cache until reload)
  useEffect(() => {
    if (activeMenu !== "analytics" || installs.length > 0) return
    let isCancelled = false
    const fetchInstalls = async () => {
      setIsLoadingInstalls(true)
      setInstallsError("")
      try {
        const allInstalls: InfluencerInstall[] = []
        let currentPage = 1
        let hasMore = true
        
        // Fetch all pages (max 100 per page)
        while (hasMore && !isCancelled) {
          const res = await api.getInfluencerInstalls({ page: currentPage, limit: 100 })
          if (res.success) {
            allInstalls.push(...res.installs)
            hasMore = currentPage < res.pagination.totalPages
            currentPage++
          } else {
            hasMore = false
          }
        }
        
        if (!isCancelled) {
          setInstalls(allInstalls)
        }
      } catch (err: any) {
        if (!isCancelled) setInstallsError(err.message || "Failed to load installs")
      } finally {
        if (!isCancelled) setIsLoadingInstalls(false)
      }
    }
    fetchInstalls()
    return () => { isCancelled = true }
  }, [activeMenu, installs.length])

  // Fetch all conversions for Analytics tab (for charts)
  useEffect(() => {
    if (activeMenu !== "analytics" || conversions.length > 0) return
    let isCancelled = false
    const fetchConversions = async () => {
      setIsLoadingConversions(true)
      setConversionsError("")
      try {
        const allConversions: InfluencerConversion[] = []
        let currentPage = 1
        let hasMore = true
        
        // Fetch all pages (max 100 per page)
        while (hasMore && !isCancelled) {
          const res = await api.getInfluencerConversions({ page: currentPage, limit: 100 })
          if (res.success) {
            allConversions.push(...res.conversions)
            hasMore = currentPage < res.pagination.totalPages
            currentPage++
          } else {
            hasMore = false
          }
        }
        
        if (!isCancelled) {
          setConversions(allConversions)
        }
      } catch (err: any) {
        if (!isCancelled) setConversionsError(err.message || "Failed to load conversions")
      } finally {
        if (!isCancelled) setIsLoadingConversions(false)
      }
    }
    fetchConversions()
    return () => { isCancelled = true }
  }, [activeMenu, conversions.length])

  // Reset page to 1 when switching to Audience tab
  useEffect(() => {
    if (activeMenu === "audience" && audiencePage !== 1) {
      setAudiencePage(1)
    }
  }, [activeMenu])

  // Fetch paginated conversions for Audience tab
  useEffect(() => {
    if (activeMenu !== "audience") return
    let isCancelled = false
    const fetchAudienceConversions = async () => {
      setIsLoadingAudience(true)
      setAudienceError("")
      try {
        const res = await api.getInfluencerConversions({ page: audiencePage, limit: 50 })
        if (!isCancelled) {
          if (res.success) {
            setAudienceConversions(res.conversions)
            setAudiencePagination(res.pagination)
          } else {
            setAudienceError("Failed to load conversions")
          }
        }
      } catch (err: any) {
        if (!isCancelled) setAudienceError(err.message || "Failed to load conversions")
      } finally {
        if (!isCancelled) setIsLoadingAudience(false)
      }
    }
    fetchAudienceConversions()
    return () => { isCancelled = true }
  }, [activeMenu, audiencePage])

  // Process installs data to create daily chart data
  const installsChartData = useMemo(() => {
    if (installs.length === 0) return []
    
    // Group installs by date
    const dailyCounts: Record<string, number> = {}
    installs.forEach(install => {
      const date = new Date(install.installDate).toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })
    
    // Convert to array, sort by date, then format
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({
        dateKey: date,
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(({ date, count }) => ({ date, count }))
  }, [installs])

  // Process conversions data to create daily chart data
  const conversionsChartData = useMemo(() => {
    if (conversions.length === 0) return []
    
    // Group conversions by date
    const dailyCounts: Record<string, number> = {}
    conversions.forEach(conversion => {
      const date = new Date(conversion.convertedAt).toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })
    
    // Convert to array, sort by date, then format
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({
        dateKey: date,
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(({ date, count }) => ({ date, count }))
  }, [conversions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-light tracking-tight text-gray-900">Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky lg:top-0 h-full lg:h-screen
            w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/80
            transition-transform duration-300 ease-in-out z-40
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200/80">
              <h2 className="text-2xl font-light tracking-tight text-gray-900">Karolina</h2>
              <p className="text-xs text-gray-500 mt-1 font-light">Influencer Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${
                      activeMenu === item.id
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200/80">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900 mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-500 font-light text-base sm:text-lg">
                Here's your performance overview
              </p>
            </div>

            {/* Stats Grid (Uses stats API data when available, falls back to user data) */}
            {activeMenu !== "audience" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Installs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-light text-gray-900">{(stats?.totalInstalls ?? user.totalInstalls) || 0}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-light text-gray-900">{(stats?.totalConversions ?? user.totalConversions) || 0}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-light text-gray-900">
                    ${((stats?.totalRevenue ?? user.totalRevenue) || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-light text-gray-900">
                    {((stats?.conversionRate ?? user.conversionRate) || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Profile Information, Analytics, or Audience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeMenu === "audience" ? (
              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-medium">Audience</CardTitle>
                  </div>
                  <CardDescription>Users who converted through your influencer code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingAudience ? (
                    <div className="text-center py-8 text-gray-500">Loading conversions...</div>
                  ) : audienceError ? (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{audienceError}</div>
                  ) : audienceConversions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No conversions yet</div>
                  ) : (
                    <>
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                              <TableHead className="text-gray-700">User</TableHead>
                              <TableHead className="text-gray-700">Email</TableHead>
                              <TableHead className="text-gray-700">Subscription</TableHead>
                              <TableHead className="text-gray-700">Amount</TableHead>
                              <TableHead className="text-gray-700">Platform</TableHead>
                              <TableHead className="text-gray-700">Region</TableHead>
                              <TableHead className="text-gray-700">Converted At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {audienceConversions.map((conversion) => (
                              <TableRow key={conversion._id} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium text-gray-900">
                                  {conversion.userId.firstName} {conversion.userId.lastName}
                                </TableCell>
                                <TableCell className="text-gray-700">{conversion.userId.email}</TableCell>
                                <TableCell>
                                  <span
                                    className={`
                                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${
                                        conversion.subscriptionType === "premium"
                                          ? "bg-purple-100 text-purple-700"
                                          : conversion.subscriptionType === "pro"
                                          ? "bg-black text-white"
                                          : "bg-gray-100 text-gray-700"
                                      }
                                    `}
                                  >
                                    {conversion.subscriptionType || "N/A"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-900 font-medium">
                                  ${conversion.amount.toFixed(2)} {conversion.currency}
                                </TableCell>
                                <TableCell className="text-gray-700 capitalize">{conversion.platform}</TableCell>
                                <TableCell className="text-gray-700">{conversion.region}</TableCell>
                                <TableCell className="text-gray-600">
                                  {new Date(conversion.convertedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {((audiencePagination.currentPage - 1) * audiencePagination.itemsPerPage) + 1} to{" "}
                          {Math.min(audiencePagination.currentPage * audiencePagination.itemsPerPage, audiencePagination.totalItems)} of{" "}
                          {audiencePagination.totalItems} conversions
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAudiencePage((prev) => Math.max(1, prev - 1))}
                            disabled={audiencePagination.currentPage === 1 || isLoadingAudience}
                            className="h-9 px-3"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <div className="text-sm text-gray-600 px-2">
                            Page {audiencePagination.currentPage} of {audiencePagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAudiencePage((prev) => prev + 1)}
                            disabled={audiencePagination.currentPage >= audiencePagination.totalPages || isLoadingAudience}
                            className="h-9 px-3"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              ) : activeMenu !== "analytics" ? (
              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-medium">Profile Information</CardTitle>
                  </div>
                  <CardDescription>Your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                    <p className="text-base font-light text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="text-base font-light text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.email}
                    </p>
                  </div>
                  {user.influencerCode && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Influencer Code</p>
                      <p className="text-base font-light text-gray-900 font-mono">
                        {user.influencerCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Status</p>
                    <span
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              ) : (
              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-medium">Analytics</CardTitle>
                  </div>
                  <CardDescription>Your installs and conversions over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Daily Installs</p>
                    {isLoadingInstalls ? (
                      <div className="h-[260px] flex items-center justify-center text-gray-500">Loading installs...</div>
                    ) : installsError ? (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{installsError}</div>
                    ) : installsChartData.length > 0 ? (
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={installsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                            <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: "#7c3aed" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[260px] flex items-center justify-center text-gray-500">No install data</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Daily Conversions</p>
                    {isLoadingConversions ? (
                      <div className="h-[260px] flex items-center justify-center text-gray-500">Loading conversions...</div>
                    ) : conversionsError ? (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{conversionsError}</div>
                    ) : conversionsChartData.length > 0 ? (
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={conversionsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[260px] flex items-center justify-center text-gray-500">No conversion data</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              )}

              {activeMenu !== "audience" && (
              <Card className="shadow-lg border border-gray-200/80 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-medium">Performance Metrics</CardTitle>
                  </div>
                  <CardDescription>Your campaign statistics and earnings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Fee Percentage</p>
                    <p className="text-2xl font-light text-gray-900">{(stats?.feePercentage ?? user.feePercentage) || 0}%</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Earnings Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Installs</span>
                        <span className="text-sm font-medium text-gray-900">{(stats?.totalInstalls ?? user.totalInstalls) || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Conversions</span>
                        <span className="text-sm font-medium text-gray-900">{(stats?.totalConversions ?? user.totalConversions) || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-base font-medium text-gray-900">Total Revenue</span>
                        <span className="text-base font-semibold text-gray-900">${((stats?.totalRevenue ?? user.totalRevenue) || 0).toLocaleString()}</span>
                      </div>
                      {typeof stats?.totalPayout === "number" && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Payout</span>
                          <span className="text-sm font-medium text-gray-900">${(stats?.totalPayout || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

