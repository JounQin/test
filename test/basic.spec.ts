import { expect, test } from 'vitest'

import text from '../src/index.js'

test('basic', () => {
  expect(text).toBe('Hello World!')
})
