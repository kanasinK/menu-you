// Helper functions สำหรับจัดการ authentication
export const setAuthCookie = (value: boolean) => {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setDate(expires.getDate() + 7) // cookie หมดอายุใน 7 วัน
  
  document.cookie = `isAuthenticated=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
  
  // เก็บใน localStorage ด้วยเพื่อความ backward compatible
  localStorage.setItem('isAuthenticated', value.toString())
}

export const removeAuthCookie = () => {
  if (typeof window === 'undefined') return
  
  document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  localStorage.removeItem('isAuthenticated')
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // ตรวจสอบทั้ง cookie และ localStorage
  const cookieAuth = document.cookie
    .split('; ')
    .find(row => row.startsWith('isAuthenticated='))
    ?.split('=')[1] === 'true'
  
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true'
  
  return cookieAuth || localStorageAuth
}

