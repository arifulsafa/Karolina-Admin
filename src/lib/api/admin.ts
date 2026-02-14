const API_BASE_URL = "http://localhost:3000/api/users"

export interface AdminLoginResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    age?: number
    weight?: number
    height?: number
    gender?: string
    activityLevel?: string
    dailyCalorieGoal?: number
    supabaseId?: string
    revenueCatId?: string
    subscriptionStatus?: string
    timezone?: string
    language?: string
    units?: string
    dietaryPreferences?: string[]
    allergies?: string[]
    healthConditions?: string[]
    fitnessGoals?: string
    targetWeight?: number
    weeklyGoal?: number
    createdAt?: string
    updatedAt?: string
    [key: string]: any
  }
}

export const adminAPI = {
  // Login with email and password
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
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
}

