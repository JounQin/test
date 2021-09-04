import { useEffect, useState } from 'react'

import { useConstant } from './constant'

import type { ValueOf } from 'types'

export const PromiseStatus = {
  FULFILLED: 'fulfilled',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const

export type PromiseStatus = ValueOf<typeof PromiseStatus>

export type PromiseResult<T> = [
  data: T | null | undefined,
  error: unknown,
  status: PromiseStatus,
]

export const usePromise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  deps: unknown[] = [],
) => {
  const [result, setResult] = useState<PromiseResult<T>>([
    undefined,
    undefined,
    PromiseStatus.PENDING,
  ])
  const value = useConstant(promise, deps)
  useEffect(() => {
    if (result[2] !== PromiseStatus.PENDING) {
      setResult([result[0], result[1], PromiseStatus.PENDING])
    }
    let canceled = false
    value
      .then(data => {
        if (canceled) {
          return
        }
        setResult([data, null, PromiseStatus.FULFILLED])
      })
      .catch((error: unknown) => {
        if (canceled) {
          return
        }
        setResult([null, error, PromiseStatus.REJECTED])
      })
    return () => {
      canceled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `result` is the effect
  }, [value])
  return result
}
