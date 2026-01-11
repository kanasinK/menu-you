import axios from 'axios'
import { loadingActions } from '@/store/loadingStore'

export const http = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  config => {
    loadingActions.start()
    return config
  },
  error => {
    loadingActions.stop()
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  response => {
    loadingActions.stop()
    return response
  },
  error => {
    loadingActions.stop()
    return Promise.reject(error)
  }
)
