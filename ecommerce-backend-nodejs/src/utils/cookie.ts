import { config } from 'dotenv'
import { Response } from 'express'
config()

const maxAgeInSeconds = Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 900

export const setRefreshCookie = (res: Response, refresh_token: string) => {
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: maxAgeInSeconds * 1000
  })
}

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  })
}
