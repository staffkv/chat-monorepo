import ky from 'ky'

export const api = ky.create({
  prefixUrl: process.env.NEXT_API_URL,
  credentials: 'include',
})