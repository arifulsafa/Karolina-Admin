const API_BASE_URL = "http://localhost:3000/api/influencers"

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

export const influencerAPI = {
  // Check if email is verified
  async checkVerification(email: string): Promise<CheckVerificationResponse> {
    const response = await fetch(
      `${API_BASE_URL}/check-verification?email=${encodeURIComponent(email)}`,
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

  // Login with email and optional password
  async login(email: string, password?: string): Promise<InfluencerLoginResponse> {
    const body: { email: string; password?: string } = { email }
    if (password) {
      body.password = password
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
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

  // Verify email with token and set password
  async verifyEmail(token: string, password: string): Promise<VerifyEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
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
}

