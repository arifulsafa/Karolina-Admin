import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Mail, TrendingUp, Edit2, Save, X } from "lucide-react"
import { api, type AdminInfluencerDetail } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"

export default function InfluencerDetailPage() {
  const { influencerId } = useParams<{ influencerId: string }>()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [influencer, setInfluencer] = useState<AdminInfluencerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<AdminInfluencerDetail>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (!influencerId) {
      setError("Influencer ID is missing")
      setIsLoading(false)
      return
    }

    const fetchInfluencer = async () => {
      try {
        const response = await api.getAdminInfluencerDetail(influencerId)
        if (response.success && response.influencer) {
          setInfluencer(response.influencer)
          setEditedData({
            firstName: response.influencer.firstName,
            lastName: response.influencer.lastName,
            email: response.influencer.email,
            influencerCode: response.influencer.influencerCode,
            isActive: response.influencer.isActive,
          })
        } else {
          setError("Failed to load influencer details")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load influencer details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfluencer()
  }, [influencerId])

  const handleEdit = () => {
    if (influencer) {
      setEditedData({
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        email: influencer.email,
        influencerCode: influencer.influencerCode,
        isActive: influencer.isActive,
      })
      setIsEditing(true)
      setSaveError("")
    }
  }

  const handleCancel = () => {
    if (influencer) {
      setEditedData({
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        email: influencer.email,
        influencerCode: influencer.influencerCode,
        isActive: influencer.isActive,
      })
    }
    setIsEditing(false)
    setSaveError("")
  }

  const handleSave = async () => {
    if (!influencerId || !influencer) return

    setIsSaving(true)
    setSaveError("")

    try {
      const response = await api.updateAdminInfluencerDetail(influencerId, editedData)
      if (response.success && response.influencer) {
        setInfluencer(response.influencer)
        setIsEditing(false)
      } else {
        setSaveError("Failed to update influencer details")
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to update influencer details")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!influencerId) return
    setIsDeleting(true)
    setDeleteError("")
    try {
      const res = await api.deleteAdminInfluencer(influencerId)
      if (res.success) {
        setIsDeleteOpen(false)
        navigate("/admin/dashboard", { state: { initialTab: "influencers" } })
      } else {
        setDeleteError(res.message || "Failed to delete influencer")
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete influencer")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!authUser || authUser.type !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading influencer details...</div>
      </div>
    )
  }

  if (error || !influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "Influencer not found"}</p>
            <Button onClick={() => navigate("/admin/dashboard")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/dashboard", { state: { initialTab: "influencers" } })}
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Influencers
            </Button>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={editedData.firstName || ""}
                        onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={editedData.lastName || ""}
                        onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedData.email || ""}
                      onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                      className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="influencerCode" className="text-sm font-medium text-gray-700">
                      Influencer Code
                    </Label>
                    <Input
                      id="influencerCode"
                      value={editedData.influencerCode || ""}
                      onChange={(e) => setEditedData({ ...editedData, influencerCode: e.target.value })}
                      className="mt-1 bg-white border-gray-300 focus:border-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                    <select
                      value={editedData.isActive ? "active" : "inactive"}
                      onChange={(e) => setEditedData({ ...editedData, isActive: e.target.value === "active" })}
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-gray-900 text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900 mb-2">
                    {influencer.firstName && influencer.lastName
                      ? `${influencer.firstName} ${influencer.lastName}`
                      : influencer.firstName || influencer.email.split("@")[0]}
                  </h1>
                  <p className="text-gray-500 font-light flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {influencer.email}
                  </p>
                </>
              )}
            </div>
          </div>
          {saveError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {saveError}
            </div>
          )}
        </div>
        {isDeleteOpen && createPortal(
          (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => !isDeleting && setIsDeleteOpen(false)} />
              <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl bg-white shadow-xl border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Delete Influencer</h3>
                  <p className="text-sm text-gray-500 mt-1">This action cannot be undone. Are you sure?</p>
                </div>
                <div className="p-6 space-y-3">
                  {deleteError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {deleteError}
                    </div>
                  )}
                </div>
                <div className="p-6 pt-0 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ),
          document.body
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Basic Information</CardTitle>
                </div>
                <CardDescription className="text-gray-500">Influencer account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {influencer.firstName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                        <p className="text-base font-light text-gray-900">{influencer.firstName}</p>
                      </div>
                    )}
                    {influencer.lastName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                        <p className="text-base font-light text-gray-900">{influencer.lastName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                      <p className="text-base font-light text-gray-900">{influencer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Influencer Code</p>
                      <p className="text-base font-light text-gray-900 font-mono">
                        {influencer.influencerCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      <span
                        className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${influencer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        `}
                      >
                        {influencer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                      <p className="text-base font-light text-gray-900">{formatDate(influencer.createdAt)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Basic information is being edited in the header section above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Performance Metrics</CardTitle>
                </div>
                <CardDescription className="text-gray-500">Revenue and performance statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-light text-gray-900">
                      ${(influencer.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Installs</p>
                    <p className="text-3xl font-light text-gray-900">
                      {influencer.totalInstalls || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Conversions</p>
                    <p className="text-3xl font-light text-gray-900">
                      {influencer.totalConversions || 0}
                    </p>
                  </div>
                  {influencer.totalPayout !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Payout</p>
                      <p className="text-3xl font-light text-gray-900">
                        ${(influencer.totalPayout || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</p>
                      <p className="text-2xl font-light text-gray-900">
                        {(influencer.conversionRate || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Fee Percentage</p>
                      <p className="text-2xl font-light text-gray-900">
                        {influencer.feePercentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${influencer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                    `}
                  >
                    {influencer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email Verified</p>
                  <span
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${influencer.isEmailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                    `}
                  >
                    {influencer.isEmailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                {influencer.isPasswordSet !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Password Set</p>
                    <span
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${influencer.isPasswordSet ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      `}
                    >
                      {influencer.isPasswordSet ? "Set" : "Not Set"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Influencer ID</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{influencer.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                  <p className="text-base font-light text-gray-900">{formatDateTime(influencer.createdAt)}</p>
                </div>
                {influencer.updatedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                    <p className="text-base font-light text-gray-900">
                      {formatDateTime(influencer.updatedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


