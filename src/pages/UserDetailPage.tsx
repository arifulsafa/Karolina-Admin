import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Mail, Target, Settings, TrendingUp, Edit2, Save, X } from "lucide-react"
import { api, type AdminUserDetail } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<AdminUserDetail>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing")
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const response = await api.getAdminUserDetail(userId)
        if (response.success && response.user) {
          setUser(response.user)
          setEditedData({
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            age: response.user.age,
            weight: response.user.weight,
            height: response.user.height,
            gender: response.user.gender,
            activityLevel: response.user.activityLevel,
            dailyCalorieGoal: response.user.dailyCalorieGoal,
            fitnessGoals: response.user.fitnessGoals,
            targetWeight: response.user.targetWeight,
            subscriptionStatus: response.user.subscriptionStatus,
            timezone: response.user.timezone,
            language: response.user.language,
            units: response.user.units,
          })
        } else {
          setError("Failed to load user details")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load user details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleEdit = () => {
    if (user) {
      setEditedData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activityLevel,
        dailyCalorieGoal: user.dailyCalorieGoal,
        fitnessGoals: user.fitnessGoals,
        targetWeight: user.targetWeight,
        subscriptionStatus: user.subscriptionStatus,
        timezone: user.timezone,
        language: user.language,
        units: user.units,
      })
      setIsEditing(true)
      setSaveError("")
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditedData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activityLevel,
        dailyCalorieGoal: user.dailyCalorieGoal,
        fitnessGoals: user.fitnessGoals,
        targetWeight: user.targetWeight,
        subscriptionStatus: user.subscriptionStatus,
        timezone: user.timezone,
        language: user.language,
        units: user.units,
      })
    }
    setIsEditing(false)
    setSaveError("")
  }

  const handleDelete = async () => {
    if (!userId) return
    setIsDeleting(true)
    setDeleteError("")
    try {
      const res = await api.deleteAdminUser(userId)
      if (res.success) {
        setIsDeleteOpen(false)
        navigate("/admin/dashboard", { state: { initialTab: "users" } })
      } else {
        setDeleteError(res.message || "Failed to delete user")
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  const validateWeight = (weight: number | undefined, units: string | undefined): string | null => {
    if (weight === undefined || weight === null) return null
    
    const isImperial = units === "imperial" || user?.isImperial
    if (isImperial) {
      if (weight < 44 || weight > 1100) {
        return "Weight must be between 44-1100 lbs (imperial)"
      }
    } else {
      if (weight < 20 || weight > 500) {
        return "Weight must be between 20-500 kg (metric)"
      }
    }
    return null
  }

  const validateHeight = (height: number | undefined): string | null => {
    if (height === undefined || height === null) return null
    
    const isImperial = user?.units === "imperial" || user?.isImperial
    if (isImperial) {
      // Typically 36-96 inches (3-8 feet)
      if (height < 36 || height > 96) {
        return "Height must be between 36-96 inches (imperial)"
      }
    } else {
      // Typically 91-244 cm (0.91-2.44 meters)
      if (height < 91 || height > 244) {
        return "Height must be between 91-244 cm (metric)"
      }
    }
    return null
  }

  const handleSave = async () => {
    if (!userId || !user) return

    setIsSaving(true)
    setSaveError("")

    // Validate weight if provided
    if (editedData.weight !== undefined && editedData.weight !== null) {
      const weightError = validateWeight(editedData.weight, editedData.units || user.units)
      if (weightError) {
        setSaveError(weightError)
        setIsSaving(false)
        return
      }
    }

    // Validate height if provided
    if (editedData.height !== undefined && editedData.height !== null) {
      const heightError = validateHeight(editedData.height)
      if (heightError) {
        setSaveError(heightError)
        setIsSaving(false)
        return
      }
    }

    // Validate target weight if provided
    if (editedData.targetWeight !== undefined && editedData.targetWeight !== null) {
      const targetWeightError = validateWeight(editedData.targetWeight, editedData.units || user.units)
      if (targetWeightError) {
        setSaveError(targetWeightError.replace("Weight", "Target weight"))
        setIsSaving(false)
        return
      }
    }

    // Validate age if provided
    if (editedData.age !== undefined && editedData.age !== null) {
      if (editedData.age < 13 || editedData.age > 120) {
        setSaveError("Age must be between 13-120 years")
        setIsSaving(false)
        return
      }
    }

    // Validate daily calorie goal if provided
    if (editedData.dailyCalorieGoal !== undefined && editedData.dailyCalorieGoal !== null) {
      if (editedData.dailyCalorieGoal < 1000 || editedData.dailyCalorieGoal > 10000) {
        setSaveError("Daily calorie goal must be between 1000-10000 kcal")
        setIsSaving(false)
        return
      }
    }

    try {
      const response = await api.updateAdminUserDetail(userId, editedData)
      if (response.success && response.user) {
        setUser(response.user)
        setIsEditing(false)
        setSaveError("")
      } else {
        setSaveError("Failed to update user details")
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to update user details")
    } finally {
      setIsSaving(false)
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
        <div className="text-gray-500">Loading user details...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "User not found"}</p>
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
              onClick={() => navigate("/admin/dashboard", { state: { initialTab: "users" } })}
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
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
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-gray-900 mb-2">
                {user.firstName} {user.lastName || ""}
              </h1>
              <p className="text-gray-500 font-light flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>
          {saveError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {saveError}
            </div>
          )}
          {isDeleteOpen && createPortal(
            (
              <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => !isDeleting && setIsDeleteOpen(false)} />
                <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl bg-white shadow-xl border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Personal Information</CardTitle>
                </div>
                <CardDescription className="text-gray-500">User's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.firstName || ""}
                        onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    ) : (
                      <p className="text-base font-light text-gray-900">{user.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.lastName || ""}
                        onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    ) : (
                      <p className="text-base font-light text-gray-900">{user.lastName || ""}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">Email Address</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedData.email || ""}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    ) : (
                      <p className="text-base font-light text-gray-900">{user.email}</p>
                    )}
                  </div>
                  {user.age !== undefined && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Age</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedData.age || ""}
                          onChange={(e) => setEditedData({ ...editedData, age: e.target.value ? Number(e.target.value) : undefined })}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      ) : (
                        <p className="text-base font-light text-gray-900">{user.age} years</p>
                      )}
                    </div>
                  )}
                  {user.gender && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Gender</Label>
                      {isEditing ? (
                        <select
                          value={editedData.gender || ""}
                          onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-gray-900 text-gray-900"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p className="text-base font-light text-gray-900 capitalize">{user.gender}</p>
                      )}
                    </div>
                  )}
                  {user.birthdate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Birthdate</p>
                      <p className="text-base font-light text-gray-900">{formatDate(user.birthdate)}</p>
                    </div>
                  )}
                  {user.timezone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Timezone</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.timezone || ""}
                          onChange={(e) => setEditedData({ ...editedData, timezone: e.target.value })}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      ) : (
                        <p className="text-base font-light text-gray-900">{user.timezone}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Physical Stats */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Physical Stats</CardTitle>
                </div>
                <CardDescription className="text-gray-500">Weight, height, and measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {user.weight !== undefined && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Current Weight</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            min={user.units === "imperial" || user.isImperial ? 44 : 20}
                            max={user.units === "imperial" || user.isImperial ? 1100 : 500}
                            value={editedData.weight || ""}
                            onChange={(e) => setEditedData({ ...editedData, weight: e.target.value ? Number(e.target.value) : undefined })}
                            className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                            placeholder={user.units === "imperial" || user.isImperial ? "44-1100 lbs" : "20-500 kg"}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {user.units === "imperial" || user.isImperial ? "Range: 44-1100 lbs" : "Range: 20-500 kg"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-light text-gray-900">
                          {user.weight} {user.units === "imperial" || user.isImperial ? "lbs" : "kg"}
                        </p>
                      )}
                    </div>
                  )}
                  {user.height !== undefined && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Height</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            type="number"
                            min={user.units === "imperial" || user.isImperial ? 36 : 91}
                            max={user.units === "imperial" || user.isImperial ? 96 : 244}
                            value={editedData.height || ""}
                            onChange={(e) => setEditedData({ ...editedData, height: e.target.value ? Number(e.target.value) : undefined })}
                            className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                            placeholder={user.units === "imperial" || user.isImperial ? "36-96 inches" : "91-244 cm"}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {user.units === "imperial" || user.isImperial ? "Range: 36-96 inches" : "Range: 91-244 cm"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-light text-gray-900">
                          {user.height} {user.units === "imperial" || user.isImperial ? "in" : "cm"}
                        </p>
                      )}
                    </div>
                  )}
                  {user.targetWeight !== undefined && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Target Weight</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            type="number"
                            step="0.1"
                            min={user.units === "imperial" || user.isImperial ? 44 : 20}
                            max={user.units === "imperial" || user.isImperial ? 1100 : 500}
                            value={editedData.targetWeight || ""}
                            onChange={(e) => setEditedData({ ...editedData, targetWeight: e.target.value ? Number(e.target.value) : undefined })}
                            className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                            placeholder={user.units === "imperial" || user.isImperial ? "44-1100 lbs" : "20-500 kg"}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {user.units === "imperial" || user.isImperial ? "Range: 44-1100 lbs" : "Range: 20-500 kg"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-light text-gray-900">
                          {user.targetWeight !== undefined && user.targetWeight !== null ? user.targetWeight.toFixed(1) : "N/A"} {user.targetWeight !== undefined && user.targetWeight !== null ? (user.units === "imperial" || user.isImperial ? "lbs" : "kg") : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fitness Goals */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Fitness Goals</CardTitle>
                </div>
                <CardDescription className="text-gray-500">Goals and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.fitnessGoals && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Fitness Goal</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.fitnessGoals || ""}
                          onChange={(e) => setEditedData({ ...editedData, fitnessGoals: e.target.value })}
                          className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                        />
                      ) : (
                        <p className="text-base font-light text-gray-900 capitalize">
                          {user.fitnessGoals.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  )}
                  {user.activityLevel && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Activity Level</Label>
                      {isEditing ? (
                        <select
                          value={editedData.activityLevel || ""}
                          onChange={(e) => setEditedData({ ...editedData, activityLevel: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-gray-900 text-gray-900"
                        >
                          <option value="">Select activity level</option>
                          <option value="sedentary">Sedentary</option>
                          <option value="lightly_active">Lightly Active</option>
                          <option value="moderately_active">Moderately Active</option>
                          <option value="very_active">Very Active</option>
                          <option value="extremely_active">Extremely Active</option>
                        </select>
                      ) : (
                        <p className="text-base font-light text-gray-900 capitalize">
                          {user.activityLevel.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  )}
                  {user.workoutsPerWeek !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Workouts Per Week</p>
                      <p className="text-base font-light text-gray-900">{user.workoutsPerWeek}</p>
                    </div>
                  )}
                  {user.dailyCalorieGoal !== undefined && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-1 block">Daily Calorie Goal</Label>
                      {isEditing ? (
                        <div>
                          <Input
                            type="number"
                            min={1000}
                            max={10000}
                            value={editedData.dailyCalorieGoal || ""}
                            onChange={(e) => setEditedData({ ...editedData, dailyCalorieGoal: e.target.value ? Number(e.target.value) : undefined })}
                            className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                            placeholder="1000-10000 kcal"
                          />
                          <p className="text-xs text-gray-500 mt-1">Range: 1000-10000 kcal</p>
                        </div>
                      ) : (
                        <p className="text-base font-light text-gray-900">{user.dailyCalorieGoal} kcal</p>
                      )}
                    </div>
                  )}
                  {user.weeklyGoal !== undefined && user.weeklyGoal !== null && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Weekly Goal</p>
                      <p className="text-base font-light text-gray-900">
                        {user.weeklyGoal.toFixed(2)} {user.units === "imperial" || user.isImperial ? "lbs" : "kg"} per week
                      </p>
                    </div>
                  )}
                </div>
                {user.dietaryPreferences && user.dietaryPreferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Dietary Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {user.dietaryPreferences.map((pref, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.allergies && user.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {user.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.healthConditions && user.healthConditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Health Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {user.healthConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-medium text-gray-900">Account Settings</CardTitle>
                </div>
                <CardDescription className="text-gray-500">User preferences and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">Language</Label>
                    {isEditing ? (
                      <Input
                        value={editedData.language || ""}
                        onChange={(e) => setEditedData({ ...editedData, language: e.target.value })}
                        className="mt-1 bg-white border-gray-300 focus:border-gray-900"
                      />
                    ) : (
                      <p className="text-base font-light text-gray-900 uppercase">{user.language || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">Units</Label>
                    {isEditing ? (
                      <select
                        value={editedData.units || ""}
                        onChange={(e) => setEditedData({ ...editedData, units: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-gray-900 text-gray-900"
                      >
                        <option value="">Select units</option>
                        <option value="metric">Metric</option>
                        <option value="imperial">Imperial</option>
                      </select>
                    ) : (
                      <p className="text-base font-light text-gray-900 capitalize">{user.units || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Verified</p>
                    <span
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${user.isEmailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      `}
                    >
                      {user.isEmailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Rollover Calories</p>
                    <span
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${user.rolloverCalories ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      `}
                    >
                      {user.rolloverCalories ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-1 block">Status</Label>
                    {isEditing ? (
                      <select
                        value={editedData.subscriptionStatus || ""}
                        onChange={(e) => setEditedData({ ...editedData, subscriptionStatus: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-gray-900 text-gray-900"
                      >
                        <option value="">Select status</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                      </select>
                    ) : (
                      <span
                        className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${
                            user.subscriptionStatus === "premium"
                              ? "bg-purple-100 text-purple-700"
                              : user.subscriptionStatus === "pro"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                      >
                        {user.subscriptionStatus || "Free"}
                      </span>
                    )}
                  </div>
                {user.subscriptionExpiry && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Expiry Date</p>
                    <p className="text-base font-light text-gray-900">{formatDate(user.subscriptionExpiry)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{user.id}</p>
                </div>
                {user.provider && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Provider</p>
                    <p className="text-base font-light text-gray-900 capitalize">{user.provider}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                  <p className="text-base font-light text-gray-900">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                  <p className="text-base font-light text-gray-900">{formatDateTime(user.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

