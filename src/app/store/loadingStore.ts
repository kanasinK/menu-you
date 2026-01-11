import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface LoadingState {
  activeRequests: number
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  resetLoading: () => void
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    set => ({
      activeRequests: 0,
      isLoading: false,
      startLoading: () =>
        set(state => {
          const nextCount = state.activeRequests + 1
          return {
            activeRequests: nextCount,
            isLoading: nextCount > 0,
          }
        }),
      stopLoading: () =>
        set(state => {
          const nextCount = Math.max(0, state.activeRequests - 1)
          return {
            activeRequests: nextCount,
            isLoading: nextCount > 0,
          }
        }),
      resetLoading: () => set({ activeRequests: 0, isLoading: false }),
    }),
    {
      name: 'loading-store',
    }
  )
)

export const loadingActions = {
  start: () => useLoadingStore.getState().startLoading(),
  stop: () => useLoadingStore.getState().stopLoading(),
  reset: () => useLoadingStore.getState().resetLoading(),
}
