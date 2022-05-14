// @ts-check

import fs from 'node:fs/promises'

import * as acorn from 'acorn'
import acornJsx from 'acorn-jsx'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'
import { ok as assert } from 'uvu/assert'

/** @typedef {import('acorn').Position} AcornPosition */
/** @typedef {import('acorn').SourceLocation} SourceLocation */
/** @typedef {import('acorn').Token} Token */
/** @typedef {import('acorn').TokenType} TokenType */
/** @typedef {import('unist').Position} Position */

/**
 * @type {import('unified').Plugin}
 */
const plugin = () => {}

/** @type {Array<Token>} */
const tokens = []

/** @type {Record<string, TokenType>} */
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

/**
 *
 * @param {string} text
 * @param {number} offset
 * @returns {AcornPosition}
 */
const getPositionAt = (text, offset) => {
  assert(text.length >= offset)

  let currOffset = 0

  const lines = text.split('\n')

  for (let index = 0; index < lines.length; index++) {
    const line = index + 1
    const nextOffset = currOffset + lines[index].length

    if (nextOffset >= offset) {
      return {
        line,
        column: offset - currOffset,
        offset,
      }
    }

    currOffset = nextOffset + 1 // add a line break `\n` offset
  }

  throw new Error(`Invalid offset: ${offset} for text length: ${text.length}`)
}

const main = async () => {
  const text = await fs.readFile('test.mdx', 'utf8')

  /**
   *
   * @param {TokenType} type
   * @param {number} start
   * @param {number} end
   * @param {string} [value]
   * @returns {Token}
   */
  const newToken = (type, start, end, value) => ({
    type,
    value,
    start,
    end,
    loc: {
      start: getPositionAt(text, start),
      end: getPositionAt(text, end),
    },
    range: [start, end],
  })

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
    if (
      node.type !== 'mdxFlowExpression' &&
      node.type !== 'mdxJsxFlowElement' &&
      node.type !== 'mdxJsxTextElement' &&
      node.type !== 'text'
    ) {
      return
    }

    console.log(node)

    const nodePos = node.position

    assert(nodePos)

    const nodeStart = nodePos.start.offset
    const nodeEnd = nodePos.end.offset

    assert(nodeStart != null)
    assert(nodeEnd != null)

    if (node.type === 'mdxFlowExpression') {
      tokens.push(
        newToken(tt.braceL, nodeStart, nodeStart + 1),
        newToken(tt.braceR, nodeEnd - 1, nodeEnd),
      )

      return
    }

    if (node.type === 'text') {
      tokens.push(newToken(jsxTokTypes.jsxText, nodeStart, nodeEnd, node.value))
      return
    }

    tokens.push(newToken(jsxTokTypes.jsxTagStart, nodeStart, nodeStart + 1))

    const nodeName = node.name
    const nodeNameLength = nodeName?.length ?? 0

    let nodeNameStart = nodeStart + 1

    if (nodeName) {
      nodeNameStart = /** @type {number} */ (nextCharOffset(nodeStart + 1))

      assert(nodeNameStart)

      tokens.push(
        newToken(
          jsxTokTypes.jsxName,
          nodeNameStart,
          nodeNameStart + nodeNameLength,
          nodeName,
        ),
      )
    }

    // will always add 1 in `nextCharOffset`, so we minus 1 here
    let lastAttrOffset = nodeNameStart + nodeNameLength - 1

    node.attributes.forEach(attr => {
      // already handled by acorn
      if (attr.type === 'mdxJsxExpressionAttribute') {
        assert(attr.data)
        assert(attr.data.estree)
        assert(attr.data.estree.range)

        let [attrValStart, attrValEnd] = attr.data.estree.range

        attrValStart = /** @type {number} */ (prevCharOffset(attrValStart - 1))
        attrValEnd = /** @type {number} */ (nextCharOffset(attrValEnd))

        assert(text[attrValStart] === '{')
        assert(text[attrValEnd] === '}')

        lastAttrOffset = attrValEnd

        tokens.push(
          newToken(tt.braceL, attrValStart, attrValStart + 1),
          newToken(tt.braceR, attrValEnd, attrValEnd + 1),
        )

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

      assert(attrStart != null)

      const attrName = attr.name
      const attrNameLength = attrName.length

      tokens.push(
        newToken(
          jsxTokTypes.jsxName,
          attrStart,
          attrStart + attrNameLength,
          attrName,
        ),
      )

      const attrValue = attr.value

      if (!attrValue) {
        lastAttrOffset = attrStart + attrNameLength
        return
      }

      const attrEqualOffset = /** @type {number} */ (
        nextCharOffset(attrStart + attrNameLength)
      )

      assert(text[attrEqualOffset] === '=')

      tokens.push(newToken(tt.eq, attrEqualOffset, attrEqualOffset + 1, '='))

      // `mdxJsxAttributeValueExpression`, already handled by acorn
      if (typeof attrValue === 'object') {
        const data = /** @type {{estree: import('estree').Program}} */ (
          attrValue.data
        )

        let [attrValStart, attrValEnd] = /** @type {[number, number]} */ (
          data.estree.range
        )

        attrValStart = /** @type {number} */ (prevCharOffset(attrValStart - 1))
        attrValEnd = /** @type {number} */ (nextCharOffset(attrValEnd))

        assert(text[attrValStart] === '{')
        assert(text[attrValEnd] === '}')

        lastAttrOffset = attrValEnd

        tokens.push(
          newToken(tt.braceL, attrValStart, attrValStart + 1),
          newToken(tt.braceR, attrValEnd, attrValEnd + 1),
        )

        return
      }

      const attrQuoteOffset = /** @type {number} */ (
        nextCharOffset(attrEqualOffset + 1)
      )

      const attrQuote = text[attrQuoteOffset]

      assert(attrQuote === '"' || attrQuote === "'")

      tokens.push(
        newToken(
          tt.string,
          attrQuoteOffset,
          attrQuoteOffset + attrValue.length + 2,
          attrValue,
        ),
      )

      lastAttrOffset = /** @type {number} */ (
        nextCharOffset(attrQuoteOffset + attrValue.length + 1)
      )

      assert(text[lastAttrOffset] === attrQuote)
    })

    const nextOffset = /** @type {number} */ (
      nextCharOffset(lastAttrOffset + 1)
    )

    const nextChar = text[nextOffset]

    // self closing tag
    if (nextChar === '/') {
      tokens.push(newToken(tt.slash, nextOffset, nextOffset + 1, '/'))
    } else {
      assert(nextChar === '>')

      const prevOffset = /** @type {number} */ (prevCharOffset(nodeEnd - 2))

      if (nodeName) {
        tokens.push(
          newToken(
            jsxTokTypes.jsxName,
            prevOffset + 1 - nodeNameLength,
            prevOffset + 1,
            nodeName,
          ),
        )
      }

      const slashOffset = /** @type {number} */ (
        prevCharOffset(prevOffset - nodeNameLength)
      )

      assert(text[slashOffset] === '/')

      tokens.push(newToken(tt.slash, slashOffset, slashOffset + 1, '/'))

      const tagStartOffset = /** @type {number} */ (
        prevCharOffset(slashOffset - 1)
      )

      assert(text[tagStartOffset] === '<')

      tokens.push(
        newToken(jsxTokTypes.jsxTagStart, tagStartOffset, tagStartOffset + 1),
      )
    }

    tokens.push(newToken(jsxTokTypes.jsxTagEnd, nodeEnd - 1, nodeEnd))
  })

  tokens.push(newToken(tt.eof, total, total))

  await fs.writeFile(
    'test2.json',
    JSON.stringify(
      tokens
        .filter(
          t =>
            !(
              t.start === t.end &&
              (t.type === tt.braceL ||
                t.type === tt.braceR ||
                t.type === tt.parenL ||
                t.type === tt.parenR)
            ),
        )
        .sort((a, b) => a.start - b.start),
      null,
      2,
    ) + '\n',
  )
}

main()
