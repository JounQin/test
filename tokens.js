// @ts-check

import fs from 'node:fs/promises'

import * as _acorn from 'acorn'
import acornJsx from 'acorn-jsx'

const acorn = acornJsx({
  allowNamespacedObjects: true,
})(_acorn.Parser)

/** @type {Record<string, import('acorn').TokenType>} */
// @ts-expect-error
const jsxTokTypes = acorn.acornJsx.tokTypes

/** @type Array.<import('acorn').Token> */
const tokens = []

const main = async () => {
  acorn.parse(await fs.readFile('test.mdx', 'utf8'), {
    ecmaVersion: 'latest',
    locations: true,
    ranges: true,
    onToken: tokens,
  })

  await fs.writeFile('test1.json', JSON.stringify(tokens, null, 2))
}

main()
