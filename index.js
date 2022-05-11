// @ts-check

import fs from 'node:fs/promises'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'

/** @type Array.<import('acorn').Token> */
const tokens = []

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx, {
    acornOptions: {
      ecmaVersion: 'latest',
      onToken: tokens,
    },
  })

const main = async () => {
  processor.parse(await fs.readFile('test.mdx', 'utf8'))
  console.log(JSON.stringify(tokens, null, 2))
}

main()
