import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'

config()

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
export const verifyAccessToken = (token: string) => {
  return verifyToken({
    token,
    secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
  })
}

// Wrapper cho refresh token (nếu cần)
export const verifyRefreshToken = (token: string) => {
  return verifyToken({
    token,
    secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
  })
}
