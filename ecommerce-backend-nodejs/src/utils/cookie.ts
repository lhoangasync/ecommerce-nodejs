import { config } from 'dotenv'
import { Response } from 'express'
import ms, { StringValue } from 'ms'
config()

export const setRefreshCookie = (res: Response, refresh_token: string) => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: ms(expiresIn as StringValue)
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
// export const setAccessCookie = (res: Response, access_token: string) => {
//   res.cookie('access_token', access_token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/',
//     maxAge: 15 * 60 * 1000 // 15min
//   })
// }
