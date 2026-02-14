const API_BASE_URL = "http://localhost:3000/api"

// ==================== ADMIN API ====================

export interface AdminLoginResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    [key: string]: any
  }
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName?: string
  subscriptionStatus?: string
  createdAt: string
}

export interface AdminUserDetail {
  id: string
  email: string
  firstName: string
  lastName?: string
  age?: number
  weight?: number
  height?: number
  gender?: string
  birthdate?: string
  activityLevel?: string
  workoutsPerWeek?: number
  dailyCalorieGoal?: number
  fitnessGoals?: string
  targetWeight?: number
  weightGoal?: number | null
  weeklyGoal?: number
  speedToGoal?: number
  subscriptionStatus?: string
  subscriptionExpiry?: string | null
  supabaseId?: string
  revenueCatId?: string
  platform?: string | null
  provider?: string
  providerId?: string
  isEmailVerified?: boolean
  profilePicture?: string | null
  timezone?: string
  language?: string
  units?: string
  isImperial?: boolean
  dietaryPreferences?: string[]
  allergies?: string[]
  healthConditions?: string[]
  includeStepCaloriesInGoal?: boolean
  rolloverCalories?: boolean
  addBurnedCalories?: boolean
  referrerId?: string
  hearAboutUs?: string
  triedOtherCalorieTrackingApps?: boolean
  whatStoppingFromReachingGoals?: string | null
  followSpecificDiet?: boolean
  specificDiet?: string
  whatWouldLikeToAccomplish?: string
  oneSignalId?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface AdminUserDetailResponse {
  success: boolean
  user: AdminUserDetail
}

export interface DeleteUserResponse {
  success: boolean
  message?: string
}

export interface AdminUsersResponse {
  success: boolean
  users: AdminUser[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface AdminInfluencer {
  id: string
  email: string
  influencerCode: string
  isActive: boolean
  totalRevenue: number
  totalInstalls: number
  createdAt: string
}

export interface AdminInfluencerDetail {
  id: string
  email: string
  firstName?: string
  lastName?: string
  influencerCode: string
  isActive: boolean
  isEmailVerified?: boolean
  isPasswordSet?: boolean
  totalInstalls: number
  totalConversions: number
  totalRevenue: number
  conversionRate: number
  feePercentage: number
  totalPayout?: number
  createdAt: string
  updatedAt?: string
  [key: string]: any
}

export interface AdminInfluencerDetailResponse {
  success: boolean
  influencer: AdminInfluencerDetail
}

export interface AdminInfluencersResponse {
  success: boolean
  influencers: AdminInfluencer[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface RegisterInfluencerBody {
  email: string
  // password?: string
  firstName?: string
  lastName?: string
  feePercentage?: number
  influencerCode: string
}

export interface RegisterInfluencerResponse {
  success: boolean
  message: string
  influencer: AdminInfluencerDetail
}

export interface DeleteInfluencerResponse {
  success: boolean
  message?: string
}

export interface GrowthDataPoint {
  month: string
  userCount: number
  influencerCount: number
  cumulativeUsers: number
  cumulativeInfluencers: number
}

export interface AdminGrowthResponse {
  success: boolean
  data: GrowthDataPoint[]
  summary: {
    totalUsers: number
    totalInfluencers: number
    period: {
      startDate: string
      endDate: string
    }
  }
}

export interface GetAdminUsersParams {
  page?: number
  limit?: number
  search?: string
  subscriptionStatus?: "free" | "premium" | "pro"
  platform?: "ios" | "android" | "web"
  sortBy?: "createdAt" | "email" | "firstName" | "subscriptionStatus" | "dailyCalorieGoal"
  sortOrder?: "asc" | "desc"
}

// ==================== INFLUENCER API ====================

export interface InfluencerLoginResponse {
  success: boolean
  message: string
  token?: string
  influencer?: {
    id: string
    email: string
    firstName: string
    lastName: string
    influencerCode: string
    isActive: boolean
    isEmailVerified?: boolean
    isPasswordSet?: boolean
    totalInstalls: number
    totalConversions: number
    totalRevenue: number
    conversionRate: number
    feePercentage: number
  }
}

export interface CheckVerificationResponse {
  success: boolean
  email: string
  exists: boolean
  isEmailVerified: boolean
  isPasswordSet: boolean
  message: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  token: string
  influencer: {
    id: string
    email: string
    firstName: string
    lastName: string
    influencerCode: string
    isActive: boolean
    isEmailVerified: boolean
    isPasswordSet: boolean
    totalInstalls: number
    totalConversions: number
    totalRevenue: number
    conversionRate: number
    feePercentage: number
  }
}

export interface InfluencerStatsResponse {
  success: boolean
  stats: {
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
  }
}

export interface InfluencerInstall {
  _id: string
  influencerId: string
  influencerCode: string
  platform: string
  region: string
  timezone: string
  deviceModel?: string
  osVersion?: string
  appVersion?: string
  installSource?: string
  installDate: string
  createdAt: string
  updatedAt: string
}

export interface InfluencerInstallsResponse {
  success: boolean
  installs: InfluencerInstall[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface InfluencerConversion {
  _id: string
  influencerId: string
  influencerCode: string
  userId: {
    _id: string
    email: string
    firstName: string
    lastName: string
    subscriptionStatus: string
    rolloverCalories?: boolean
    addBurnedCalories?: boolean
  }
  subscriptionType: string
  amount: number
  currency: string
  platform: string
  region: string
  timezone: string
  convertedAt: string
  feePercentageAtConversion: number
  payoutAmount: number
  createdAt: string
  updatedAt: string
}

export interface InfluencerConversionsResponse {
  success: boolean
  conversions: InfluencerConversion[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

// ==================== API FUNCTIONS ====================

export const api = {
  // Admin Login
  async adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, platform: "web" }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return response.json()
  },

  // Get Admin User Detail
  async getAdminUserDetail(userId: string): Promise<AdminUserDetailResponse> {
    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user details")
    }

    return response.json()
  },

  // Update Admin User Detail
  async updateAdminUserDetail(
    userId: string,
    data: Partial<AdminUserDetail>
  ): Promise<AdminUserDetailResponse> {
    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update user details" }))
      throw new Error(error.message || "Failed to update user details")
    }

    return response.json()
  },

  // Delete Admin User
  async deleteAdminUser(userId: string): Promise<DeleteUserResponse> {
    const token = localStorage.getItem("auth_token")

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete user" }))
      throw new Error(error.message || "Failed to delete user")
    }

    return response.json()
  },

  // Get Admin Users
  async getAdminUsers(params: GetAdminUsersParams = {}): Promise<AdminUsersResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.search) queryParams.append("search", params.search)
    if (params.subscriptionStatus) queryParams.append("subscriptionStatus", params.subscriptionStatus)
    if (params.platform) queryParams.append("platform", params.platform)
    if (params.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  },

  // Get Admin Influencers
  async getAdminInfluencers(params: GetAdminUsersParams = {}): Promise<AdminInfluencersResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.search) queryParams.append("search", params.search)

    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/influencers?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch influencers")
    }

    return response.json()
  },

  // Register Influencer (Admin)
  async registerInfluencer(data: RegisterInfluencerBody): Promise<RegisterInfluencerResponse> {
    const token = localStorage.getItem("auth_token")

    const response = await fetch(`${API_BASE_URL}/influencers/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to register influencer" }))
      throw new Error(error.message || "Failed to register influencer")
    }

    return response.json()
  },

  // Get Admin Growth Data
  async getAdminGrowth(): Promise<AdminGrowthResponse> {
    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/growth/monthly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch growth data")
    }

    return response.json()
  },

  // Get Admin Influencer Detail
  async getAdminInfluencerDetail(influencerId: string): Promise<AdminInfluencerDetailResponse> {
    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/influencers/${influencerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch influencer details")
    }

    return response.json()
  },

  // Update Admin Influencer Detail
  async updateAdminInfluencerDetail(
    influencerId: string,
    data: Partial<AdminInfluencerDetail>
  ): Promise<AdminInfluencerDetailResponse> {
    const token = localStorage.getItem("auth_token")
    
    const response = await fetch(`${API_BASE_URL}/admin/influencers/${influencerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update influencer details" }))
      throw new Error(error.message || "Failed to update influencer details")
    }

    return response.json()
  },

  // Delete Admin Influencer
  async deleteAdminInfluencer(influencerId: string): Promise<DeleteInfluencerResponse> {
    const token = localStorage.getItem("auth_token")

    const response = await fetch(`${API_BASE_URL}/admin/influencers/${influencerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete influencer" }))
      throw new Error(error.message || "Failed to delete influencer")
    }

    return response.json()
  },

  // Influencer - Check Verification
  async checkInfluencerVerification(email: string): Promise<CheckVerificationResponse> {
    const response = await fetch(
      `${API_BASE_URL}/influencers/check-verification?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to check verification status")
    }

    return response.json()
  },

  // Influencer - Login
  async influencerLogin(email: string, password?: string): Promise<InfluencerLoginResponse> {
    const body: { email: string; password?: string } = { email }
    if (password) {
      body.password = password
    }

    const response = await fetch(`${API_BASE_URL}/influencers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return response.json()
  },

  // Influencer - Verify Email
  async influencerVerifyEmail(token: string, password: string): Promise<VerifyEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/influencers/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    })

    if (!response.ok) {
      throw new Error("Email verification failed")
    }

    return response.json()
  },

  // Influencer - Stats (requires influencer auth token)
  async getInfluencerStats(): Promise<InfluencerStatsResponse> {
    const token = localStorage.getItem("auth_token")
    const response = await fetch(`${API_BASE_URL}/influencers/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch influencer stats")
    }

    return response.json()
  },

  // Influencer - Installs (requires influencer auth token)
  async getInfluencerInstalls(params?: { page?: number; limit?: number }): Promise<InfluencerInstallsResponse> {
    const token = localStorage.getItem("auth_token")
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const response = await fetch(`${API_BASE_URL}/influencers/installs?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch influencer installs")
    }

    return response.json()
  },

  // Influencer - Conversions (requires influencer auth token)
  async getInfluencerConversions(params?: { page?: number; limit?: number }): Promise<InfluencerConversionsResponse> {
    const token = localStorage.getItem("auth_token")
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const response = await fetch(`${API_BASE_URL}/influencers/conversions?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch influencer conversions")
    }

    return response.json()
  },
}

