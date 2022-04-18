import fs from 'fs/promises'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'

const processor = unified().use(remarkParse).use(remarkMdx)

const main = async () => {
  const root = processor.parse(await fs.readFile('test.mdx', 'utf8'))

  visit(
    root,
    node => node.data?.estree.comments?.length,
    node => {
      console.log(JSON.stringify(node.data.estree.comments, null, 2))
    },
  )
}

main()
