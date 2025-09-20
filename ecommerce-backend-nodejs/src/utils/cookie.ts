import { Response } from 'express'

export const setRefreshCookie = (res: Response, refresh_token: string) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

export const clearRefreshCookie = (res: Response) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
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
