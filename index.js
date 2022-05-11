// @ts-check

import fs from 'node:fs/promises'

import * as acorn from 'acorn'
import acornJsx from 'acorn-jsx'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'

/** @typedef {import('unist').Position} Position */

/**
 * @type {import('unified').Plugin}
 */
const plugin = () => {}

/** @type Array.<import('acorn').Token> */
const tokens = []

/** @type {Record<string, import('acorn').TokenType>} */
const jsxTokTypes = acornJsx(
  {
    allowNamespacedObjects: true,
  },
  // @ts-expect-error
)(acorn.Parser).acornJsx.tokTypes

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx, {
    acornOptions: {
      ecmaVersion: 'latest',
      onToken: tokens,
    },
  })
  .use(plugin)

const tt = acorn.tokTypes

const main = async () => {
  const text = await fs.readFile('test.mdx', 'utf8')

  const total = text.length

  /**
   * @param {number} offset
   * @returns {number | undefined}
   */
  const nextCharOffset = offset => {
    for (let i = offset; i <= total; i++) {
      const char = text[i]
      if (/^\S$/.test(char)) {
        return i
      }
    }
  }

  /**
   * @param {number} offset
   * @returns {number | undefined}
   */
  const prevCharOffset = offset => {
    for (let i = offset; i >= 0; i--) {
      const char = text[i]
      if (/^\S$/.test(char)) {
        return i
      }
    }
  }

  const root = processor.parse(text)

  visit(root, node => {
    // 'mdxJsxAttribute',
    //   'mdxJsxAttributeValueExpression',
    if (
      node.type !== 'mdxJsxFlowElement' &&
      node.type !== 'mdxJsxTextElement'
    ) {
      return
    }

    console.log(node)

    const nodePos = /** @type {Position} */ (node.position)

    const nodeStart = /** @type {number} */ (nodePos.start.offset)
    const nodeEnd = /** @type {number} */ (nodePos.end.offset)

    tokens.push({
      type: jsxTokTypes.jsxTagStart,
      value: undefined,
      start: nodeStart,
      end: nodeStart + 1,
    })

    const nodeName = node.name
    const nodeNameLength = nodeName?.length ?? 0

    let nodeNameStart = nodeStart + 1

    if (nodeName) {
      nodeNameStart = /** @type {number} */ (nextCharOffset(nodeStart + 1))

      console.assert(nodeNameStart !== undefined)

      tokens.push({
        type: jsxTokTypes.jsxName,
        value: nodeName,
        start: nodeNameStart,
        end: nodeNameStart + nodeNameLength,
      })
    }

    // will always add 1 in `nextCharOffset`, so we minus 1 here
    let lastAttrOffset = nodeNameStart + nodeNameLength - 1

    node.attributes.forEach(attr => {
      // already handled by acorn
      if (attr.type === 'mdxJsxExpressionAttribute') {
        const data = /** @type {{estree: import('estree').Program}} */ (
          attr.data
        )
        lastAttrOffset = /** @type {[number, number]} */ (data.estree.range)[1]
        console.log('lastAttrOffset:', lastAttrOffset)
        return
      }

      /**
       * not available yet
      /* @see https://github.com/mdx-js/mdx/issues/2034
       */
      // const attrPos = /** @type {Position} */ (attr.position)

      // const attrStart = /** @type {number} */ (attrPos.start.offset)
      // const attrEnd = /** @type {number} */ (attrPos.end.offset)

      const attrStart = /** @type {number} */ (
        nextCharOffset(lastAttrOffset + 1)
      )

      console.log('attrStart:', attrStart)

      console.assert(attrStart != null)

      const attrName = attr.name
      const attrNameLength = attrName.length

      tokens.push({
        type: jsxTokTypes.jsxName,
        value: attrName,
        start: attrStart,
        end: attrStart + attrNameLength,
      })

      const attrValue = attr.value

      if (!attrValue) {
        lastAttrOffset = attrStart + attrNameLength
        return
      }

      const attrEqualOffset = /** @type {number} */ (
        nextCharOffset(attrStart + attrNameLength)
      )

      console.log('text[attrEqualOffset]:', text[attrEqualOffset])

      console.assert(text[attrEqualOffset] === '=')

      tokens.push({
        type: tt.eq,
        value: '=',
        start: attrEqualOffset,
        end: attrEqualOffset + 1,
      })

      // `mdxJsxAttributeValueExpression`, already handled by acorn
      if (typeof attrValue === 'object') {
        const data = /** @type {{estree: import('estree').Program}} */ (
          attrValue.data
        )
        lastAttrOffset = /** @type {[number, number]} */ (data.estree.range)[1]
        return
      }

      const attrQuoteOffset = /** @type {number} */ (
        nextCharOffset(attrEqualOffset + 1)
      )

      const attrQuote = text[attrQuoteOffset]

      console.assert(attrQuote === '"' || attrQuote === "'")

      tokens.push({
        type: tt.string,
        value: attrValue,
        start: attrQuoteOffset,
        end: attrQuoteOffset + attrValue.length + 2,
      })

      lastAttrOffset = /** @type {number} */ (
        nextCharOffset(attrQuoteOffset + attrValue.length + 1)
      )

      console.log('lastAttrOffset:', lastAttrOffset)
      console.log('text[lastAttrOffset]:', text[lastAttrOffset])

      console.assert(text[lastAttrOffset] === attrQuote)
    })

    const nextOffset = /** @type {number} */ (
      nextCharOffset(lastAttrOffset + 1)
    )

    const nextChar = text[nextOffset]

    // self closing tag
    if (nextChar === '/') {
      tokens.push({
        type: tt.slash,
        value: '/',
        start: nextOffset,
        end: nextOffset + 1,
      })
    } else {
      console.assert(nextChar === '>')

      tokens.push({
        type: jsxTokTypes.jsxTagEnd,
        value: undefined,
        start: nextOffset,
        end: nextOffset + 1,
      })

      const prevOffset = /** @type {number} */ (prevCharOffset(nodeEnd - 2))

      tokens.push({
        type: jsxTokTypes.jsxName,
        value: nodeName,
        start: prevOffset + 1 - nodeNameLength,
        end: prevOffset + 1,
      })

      const slashOffset = /** @type {number} */ (
        prevCharOffset(prevOffset - nodeNameLength)
      )

      console.assert(text[slashOffset] === '/')

      tokens.push({
        type: tt.slash,
        value: '/',
        start: slashOffset,
        end: slashOffset + 1,
      })

      const tagStartOffset = /** @type {number} */ (
        prevCharOffset(slashOffset - 1)
      )

      console.assert(text[tagStartOffset] === '<')

      tokens.push({
        type: jsxTokTypes.jsxTagStart,
        value: undefined,
        start: tagStartOffset,
        end: tagStartOffset + 1,
      })
    }

    tokens.push({
      type: jsxTokTypes.jsxTagEnd,
      value: undefined,
      start: nodeEnd - 1,
      end: nodeEnd,
    })
  })

  await fs.writeFile(
    'test2.json',
    JSON.stringify(
      tokens.sort((a, b) => a.start - b.start),
      null,
      2,
    ),
  )
}

main()
