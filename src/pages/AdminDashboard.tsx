import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, User, Users, Activity, Menu, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { api, type AdminUser, type AdminInfluencer, type GetAdminUsersParams, type GrowthDataPoint } from "@/lib/api/api"

type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  { id: "overview", label: "Overview", icon: <Activity className="h-5 w-5" /> },
  { id: "users", label: "Users", icon: <Users className="h-5 w-5" /> },
  { id: "influencers", label: "Influencers", icon: <User className="h-5 w-5" /> },
]

function OverviewTab({ cachedData, onDataFetched }: { cachedData?: { growthData: GrowthDataPoint[], summary: { totalUsers: number, totalInfluencers: number } } | null, onDataFetched?: (data: { growthData: GrowthDataPoint[], summary: { totalUsers: number, totalInfluencers: number } }) => void }) {
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>(cachedData?.growthData || [])
  const [summary, setSummary] = useState(cachedData?.summary || {
    totalUsers: 0,
    totalInfluencers: 0,
  })
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState("")

  useEffect(() => {
    if (cachedData) {
      setGrowthData(cachedData.growthData)
      setSummary(cachedData.summary)
      setIsLoading(false)
      return
    }

    const fetchGrowthData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await api.getAdminGrowth()
        if (response.success) {
          const data = { growthData: response.data, summary: response.summary }
          setGrowthData(response.data)
          setSummary(response.summary)
          if (onDataFetched) {
            onDataFetched(data)
          }
        } else {
          setError("Failed to load growth data")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load growth data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrowthData()
  }, [cachedData, onDataFetched])

  // Format data for charts
  const userGrowthChartData = growthData.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    users: item.cumulativeUsers,
    newUsers: item.userCount,
  }))

  const influencerGrowthChartData = growthData.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    influencers: item.cumulativeInfluencers,
    newInfluencers: item.influencerCount,
  }))

  // Calculate month-over-month change
  const previousMonthUsers =
    growthData.length > 1 ? growthData[growthData.length - 2].userCount : 0
  const currentMonthUsers =
    growthData.length > 0 ? growthData[growthData.length - 1].userCount : 0
  const userChange = currentMonthUsers - previousMonthUsers

  const previousMonthInfluencers =
    growthData.length > 1 ? growthData[growthData.length - 2].influencerCount : 0
  const currentMonthInfluencers =
    growthData.length > 0 ? growthData[growthData.length - 1].influencerCount : 0
  const influencerChange = currentMonthInfluencers - previousMonthInfluencers

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading growth data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light text-gray-900">{summary.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {userChange >= 0 ? "+" : ""}
              {userChange} {growthData.length > 1 ? "from last month" : "this month"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light text-gray-900">{summary.totalInfluencers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {influencerChange >= 0 ? "+" : ""}
              {influencerChange}{" "}
              {growthData.length > 1 ? "from last month" : "this month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-900">User Growth</CardTitle>
            <CardDescription className="text-gray-500">
              Cumulative user growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#000"
                    strokeWidth={2}
                    dot={{ fill: "#000", r: 4 }}
                    name="Total Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-900">Influencer Growth</CardTitle>
            <CardDescription className="text-gray-500">
              Cumulative influencer growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {influencerGrowthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={influencerGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="influencers"
                    stroke="#000"
                    strokeWidth={2}
                    dot={{ fill: "#000", r: 4 }}
                    name="Total Influencers"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersTab({ cachedData, searchParams, onDataFetched }: { 
  cachedData?: { users: AdminUser[], pagination: any } | null,
  searchParams?: { search: string, subscriptionFilter: string, sortBy: string, sortOrder: string },
  onDataFetched?: (data: { users: AdminUser[], pagination: any }) => void
}) {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>(cachedData?.users || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [params, setParams] = useState<GetAdminUsersParams>({
    page: 1,
    limit: 50,
  })
  const [pagination, setPagination] = useState(cachedData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || "")
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>(searchParams?.subscriptionFilter || "")
  const [sortBy, setSortBy] = useState<GetAdminUsersParams["sortBy"]>((searchParams?.sortBy as any) || "createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams?.sortOrder as any) || "desc")

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await api.getAdminUsers({
        ...params,
        search: searchQuery || undefined,
        subscriptionStatus: subscriptionFilter as any || undefined,
        sortBy,
        sortOrder,
      })
      setUsers(response.users)
      setPagination(response.pagination)
      if (onDataFetched) {
        onDataFetched({ users: response.users, pagination: response.pagination })
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (cachedData && searchQuery === "" && subscriptionFilter === "" && sortBy === "createdAt" && sortOrder === "desc" && params.page === 1) {
      setUsers(cachedData.users)
      setPagination(cachedData.pagination)
      return
    }
    fetchUsers()
  }, [params.page, params.limit, searchQuery, subscriptionFilter, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setParams((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (value: string) => {
    setSubscriptionFilter(value)
    setParams((prev) => ({ ...prev, page: 1 }))
  }

  const handleSort = (field: GetAdminUsersParams["sortBy"]) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Users Management</CardTitle>
          <CardDescription className="text-gray-500">Manage all platform users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, first name, or last name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 bg-white/50 border-gray-200 focus:border-gray-400"
              />
            </div>
            <select
              value={subscriptionFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="h-10 px-4 rounded-xl border border-gray-200 bg-white/50 text-sm focus:outline-none focus:border-gray-400 text-gray-900"
            >
              <option value="">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      {sortBy === "email" && (
                        <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === "firstName" && (
                        <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("subscriptionStatus")}
                  >
                    <div className="flex items-center gap-2">
                      Subscription
                      {sortBy === "subscriptionStatus" && (
                        <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Created At
                      {sortBy === "createdAt" && (
                        <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <TableCell className="font-medium text-gray-900">{user.email}</TableCell>
                      <TableCell className="text-gray-700">
                        {user.firstName} {user.lastName || ""}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              user.subscriptionStatus === "premium"
                                ? "bg-purple-100 text-purple-700"
                                : user.subscriptionStatus === "pro"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {user.subscriptionStatus || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
              {pagination.totalItems} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={!pagination.hasPreviousPage || isLoading}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-gray-600 px-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={!pagination.hasNextPage || isLoading}
                className="h-9 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfluencersTab({ cachedData, searchParams, onDataFetched }: {
  cachedData?: { influencers: AdminInfluencer[], pagination: any } | null,
  searchParams?: { search: string },
  onDataFetched?: (data: { influencers: AdminInfluencer[], pagination: any }) => void
}) {
  const navigate = useNavigate()
  const [influencers, setInfluencers] = useState<AdminInfluencer[]>(cachedData?.influencers || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    influencerCode: "",
    feePercentage: 20 as number | string,
  })
  const [params, setParams] = useState<GetAdminUsersParams>({
    page: 1,
    limit: 50,
  })
  const [pagination, setPagination] = useState(cachedData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || "")

  const fetchInfluencers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await api.getAdminInfluencers({
        ...params,
        search: searchQuery || undefined,
      })
      setInfluencers(response.influencers)
      setPagination(response.pagination)
      if (onDataFetched) {
        onDataFetched({ influencers: response.influencers, pagination: response.pagination })
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch influencers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (cachedData && searchQuery === "" && params.page === 1) {
      setInfluencers(cachedData.influencers)
      setPagination(cachedData.pagination)
      return
    }
    fetchInfluencers()
  }, [params.page, params.limit, searchQuery])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setParams((prev) => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
            <div>
              <CardTitle className="text-xl font-medium text-gray-900">Influencers Management</CardTitle>
              <CardDescription className="text-gray-500">Manage all influencers</CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-4"
            >
              New Influencer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email or influencer code..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10 bg-white/50 border-gray-200 focus:border-gray-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Create Influencer Modal */}
          {isCreateOpen && createPortal(
            (
              <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isCreating && setIsCreateOpen(false)} />
                <div className="relative z-10 w-full max-w-lg mx-auto rounded-2xl bg-white shadow-xl border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Register New Influencer</h3>
                    <p className="text-sm text-gray-500 mt-1">Create a new influencer account</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {createError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {createError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label className="text-sm text-gray-700">Email</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                          placeholder="name@example.com"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">First Name</Label>
                        <Input
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">Last Name</Label>
                        <Input
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">Influencer Code</Label>
                        <Input
                          value={form.influencerCode}
                          onChange={(e) => setForm((f) => ({ ...f, influencerCode: e.target.value }))}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900 font-mono"
                          placeholder="UNIQUECODE"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-700">Fee Percentage</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={form.feePercentage}
                          onChange={(e) => setForm((f) => ({ ...f, feePercentage: e.target.value }))}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setCreateError("")
                        if (!form.email || !form.influencerCode) {
                          setCreateError("Email and influencer code are required")
                          return
                        }
                        const fee = Number(form.feePercentage)
                        if (Number.isNaN(fee) || fee < 0 || fee > 100) {
                          setCreateError("Fee percentage must be between 0-100")
                          return
                        }
                        setIsCreating(true)
                        try {
                          const res = await api.registerInfluencer({
                            email: form.email,
                            firstName: form.firstName || undefined,
                            lastName: form.lastName || undefined,
                            influencerCode: form.influencerCode,
                            feePercentage: fee,
                          })
                          if (res.success && res.influencer) {
                            setInfluencers((prev) => [
                              {
                                id: res.influencer.id,
                                email: res.influencer.email,
                                influencerCode: res.influencer.influencerCode,
                                isActive: res.influencer.isActive,
                                totalRevenue: res.influencer.totalRevenue || 0,
                                totalInstalls: res.influencer.totalInstalls || 0,
                                createdAt: res.influencer.createdAt || new Date().toISOString(),
                              },
                              ...prev,
                            ])
                            setPagination((p: any) => ({
                              ...p,
                              totalItems: (p.totalItems || 0) + 1,
                            }))
                            setIsCreateOpen(false)
                            setForm({ email: "", firstName: "", lastName: "", influencerCode: "", feePercentage: 20 })
                          } else {
                            setCreateError("Failed to register influencer")
                          }
                        } catch (err: any) {
                          setCreateError(err.message || "Failed to register influencer")
                        } finally {
                          setIsCreating(false)
                        }
                      }}
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>
              </div>
            ),
            document.body
          )}

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="text-gray-700">Email</TableHead>
                  <TableHead className="text-gray-700">Influencer Code</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Total Installs</TableHead>
                  <TableHead className="text-gray-700">Total Revenue</TableHead>
                  <TableHead className="text-gray-700">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : influencers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No influencers found
                    </TableCell>
                  </TableRow>
                ) : (
                  influencers.map((influencer) => (
                    <TableRow
                      key={influencer.id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => navigate(`/admin/influencers/${influencer.id}`)}
                    >
                      <TableCell className="font-medium text-gray-900">{influencer.email}</TableCell>
                      <TableCell className="text-gray-700 font-mono text-sm">
                        {influencer.influencerCode}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              influencer.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {influencer.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">{influencer.totalInstalls || 0}</TableCell>
                      <TableCell className="text-gray-700">
                        ${(influencer.totalRevenue || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(influencer.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
              {pagination.totalItems} influencers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={!pagination.hasPreviousPage || isLoading}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-gray-600 px-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={!pagination.hasNextPage || isLoading}
                className="h-9 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMenu, setActiveMenu] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Cache data for tabs
  const [cachedOverviewData, setCachedOverviewData] = useState<{ growthData: GrowthDataPoint[], summary: { totalUsers: number, totalInfluencers: number } } | null>(null)
  const [cachedUsersData, setCachedUsersData] = useState<{ users: AdminUser[], pagination: any } | null>(null)
  const [cachedInfluencersData, setCachedInfluencersData] = useState<{ influencers: AdminInfluencer[], pagination: any } | null>(null)

  const handleLogout = () => {
    logout()
    navigate("/auth")
  }

  if (!user || user.type !== "admin") {
    return null
  }

  // Respect initial tab from navigation state or query param
  useEffect(() => {
    const state = (location.state || {}) as any
    const qp = new URLSearchParams(location.search)
    const tabFromQuery = qp.get("tab")
    const requested = state.initialTab || tabFromQuery
    const validTabs = new Set(["overview", "users", "influencers"])
    if (requested && validTabs.has(requested)) {
      setActiveMenu(requested)
    }
  }, [location.state, location.search])

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <OverviewTab
            cachedData={cachedOverviewData}
            onDataFetched={(data) => setCachedOverviewData(data)}
          />
        )
      case "users":
        return (
          <UsersTab
            cachedData={cachedUsersData}
            onDataFetched={(data) => setCachedUsersData(data)}
          />
        )
      case "influencers":
        return (
          <InfluencersTab
            cachedData={cachedInfluencersData}
            onDataFetched={(data) => setCachedInfluencersData(data)}
          />
        )
      default:
        return (
          <OverviewTab
            cachedData={cachedOverviewData}
            onDataFetched={(data) => setCachedOverviewData(data)}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-light tracking-tight text-gray-900">Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-gray-900 hover:bg-gray-100"
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
            w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200
            transition-transform duration-300 ease-in-out z-40
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light tracking-tight text-gray-900">Karolina</h2>
                  <p className="text-xs text-gray-500 mt-1 font-light">Admin Portal</p>
                </div>
              </div>
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
                        ? "bg-black text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName || "Admin"} {user.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-gray-700 hover:text-black hover:bg-gray-100"
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
                {activeMenu === "overview"
                  ? "Overview"
                  : activeMenu === "users"
                  ? "Users"
                  : "Influencers"}
              </h1>
              <p className="text-gray-500 font-light text-base sm:text-lg">
                {activeMenu === "overview"
                  ? "Platform analytics and statistics"
                  : activeMenu === "users"
                  ? "Manage platform users"
                  : "Manage influencers"}
              </p>
            </div>

            {/* Tab Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
