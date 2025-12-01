import { google } from 'googleapis'
import { config } from 'dotenv'
import databaseService from './database.services'
import { UserRoles, UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import usersService from './user.services'

config()

class OAuthService {
  private oauth2Client

  constructor() {
    // Validate required environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables')
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_SECRET is not defined in environment variables')
    }
    if (!process.env.GOOGLE_REDIRECT_URI) {
      throw new Error('GOOGLE_REDIRECT_URI is not defined in environment variables')
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  // Google OAuth
  getGoogleAuthURL() {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]

      return this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
      })
    } catch (error) {
      throw new Error('Failed to generate Google authentication URL')
    }
  }

  async getGoogleUserInfo(code: string) {
    try {
      if (!code || code.trim() === '') {
        throw new Error('Authorization code is required and cannot be empty')
      }

      const { tokens } = await this.oauth2Client.getToken(code)

      if (!tokens || !tokens.access_token) {
        throw new Error('Failed to obtain access token from Google')
      }

      this.oauth2Client.setCredentials(tokens)

      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2'
      })

      const { data } = await oauth2.userinfo.get()

      if (!data) {
        throw new Error('No user data received from Google')
      }

      return data
    } catch (error: any) {

      if (error.code === 400 || error.message?.includes('invalid_grant')) {
        throw new Error('Invalid or expired authorization code. Please try logging in again.')
      }

      if (error.code === 401) {
        throw new Error('Invalid Google OAuth credentials')
      }

      if (error.message?.includes('redirect_uri_mismatch')) {
        throw new Error('OAuth redirect URI mismatch. Please check your configuration.')
      }

      throw new Error(`Failed to get user info from Google: ${error?.message || 'Unknown error'}`)
    }
  }

  async handleGoogleLogin(code: string) {
    try {
      const googleUser = await this.getGoogleUserInfo(code)

      if (!googleUser.email) {
        throw new Error('Email not provided by Google. Please make sure email permission is granted.')
      }

      let user = await databaseService.users.findOne({ email: googleUser.email })

      if (!user) {
        // Create new user
        const user_id = new ObjectId()
        const newUser = new User({
          _id: user_id,
          name: googleUser.name || 'Google User',
          email: googleUser.email,
          username: `google_${user_id.toString()}`,
          password: '', // No password for OAuth users
          avatar: googleUser.picture || '',
          verify: UserVerifyStatus.VERIFIED, // Auto-verify OAuth users
          role: UserRoles.USER,
          oauth_provider: 'google',
          oauth_id: googleUser.id?.toString() || null, // Ensure string conversion
          email_verify_token: '',
          forgot_password_token: ''
        })

        const insertResult = await databaseService.users.insertOne(newUser)

        if (!insertResult.acknowledged) {
          throw new Error('Failed to create user in database')
        }

        user = newUser
      } else {
        // Update existing user with Google info if needed
        const updateResult = await databaseService.users.updateOne(
          { _id: user._id },
          {
            $set: {
              oauth_provider: 'google',
              oauth_id: googleUser.id?.toString() || null, // Ensure string conversion
              avatar: googleUser.picture || user.avatar,
              verify: UserVerifyStatus.VERIFIED
            },
            $currentDate: {
              updated_at: true
            }
          }
        )

        if (!updateResult.acknowledged) {
          throw new Error('Failed to update user in database')
        }

        // Update the user object for token generation
        user.verify = UserVerifyStatus.VERIFIED
        user.role = user.role || UserRoles.USER

      }

      // Generate tokens
      const result = await usersService.login({
        user_id: user._id.toString(),
        verify: UserVerifyStatus.VERIFIED,
        role: user.role
      })

      return result
    } catch (error) {
      throw error
    }
  }

  // Facebook OAuth
  async getFacebookUserInfo(accessToken: string) {
    try {
      if (!accessToken || accessToken.trim() === '') {
        throw new Error('Facebook access token is required and cannot be empty')
      }

      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      )

      if (!response.ok) {
        const errorText = await response.text()

        if (response.status === 400) {
          throw new Error('Invalid Facebook access token')
        }

        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`)
      }

      const userData = await response.json()

      if (userData.error) {
        throw new Error(`Facebook error: ${userData.error.message}`)
      }

      return userData
    } catch (error) {
      throw error
    }
  }

  async handleFacebookLogin(accessToken: string) {
    try {
      const facebookUser = await this.getFacebookUserInfo(accessToken)

      if (!facebookUser.email) {
        throw new Error('Email not provided by Facebook. Please make sure email permission is granted.')
      }

      // Check if user already exists
      let user = await databaseService.users.findOne({ email: facebookUser.email })

      if (!user) {
        // Create new user
        const user_id = new ObjectId()
        const newUser = new User({
          _id: user_id,
          name: facebookUser.name || 'Facebook User',
          email: facebookUser.email,
          username: `facebook_${user_id.toString()}`,
          password: '', // No password for OAuth users
          avatar: facebookUser.picture?.data?.url || '',
          verify: UserVerifyStatus.VERIFIED, // Auto-verify OAuth users
          role: UserRoles.USER,
          oauth_provider: 'facebook',
          oauth_id: facebookUser.id?.toString() || null, // Ensure string conversion
          email_verify_token: '',
          forgot_password_token: ''
        })

        const insertResult = await databaseService.users.insertOne(newUser)

        if (!insertResult.acknowledged) {
          throw new Error('Failed to create user in database')
        }

        user = newUser
      } else {
        // Update existing user with Facebook info if needed
        const updateResult = await databaseService.users.updateOne(
          { _id: user._id },
          {
            $set: {
              oauth_provider: 'facebook',
              oauth_id: facebookUser.id?.toString() || null, // Ensure string conversion
              avatar: facebookUser.picture?.data?.url || user.avatar,
              verify: UserVerifyStatus.VERIFIED
            },
            $currentDate: {
              updated_at: true
            }
          }
        )

        if (!updateResult.acknowledged) {
          throw new Error('Failed to update user in database')
        }

        // Update the user object for token generation
        user.verify = UserVerifyStatus.VERIFIED
        user.role = user.role || UserRoles.USER

      }

      // Generate tokens
      const result = await usersService.login({
        user_id: user._id.toString(),
        verify: UserVerifyStatus.VERIFIED,
        role: user.role
      })

      return result
    } catch (error) {
      throw error
    }
  }
}

const oauthService = new OAuthService()
export default oauthService
