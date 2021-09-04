import { useEffect } from 'react'
import { Observable, Subscription } from 'rxjs'

export const useEnhancedEffect = (
  effect: () => unknown,
  deps: unknown[] = [],
) =>
  useEffect(() => {
    let result = effect()
    if (result instanceof Observable) {
      result = result.subscribe()
    }
    return () => {
      if (result instanceof Subscription) {
        result.unsubscribe()
      } else if (typeof result === 'function') {
        result()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intended
  }, deps)

export const useMounted = (effect: () => unknown) => useEnhancedEffect(effect)

export const useUnmounted = (effect: () => unknown, deps: unknown[] = []) =>
  useEffect(
    () => () => {
      effect()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intended
    deps,
  )
