export function getUrl(path?: string) {
  const baseUrl = process.env.NEXT_APP_URL || ''
  const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path || ''
  return `${baseUrl}${normalizedPath}`
}