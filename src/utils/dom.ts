/**
 * Copied from @see https://github.com/vuejs/vue-next/blob/master/packages/shared/src/domTagConfig.ts#L30-L31
 * See also @see https://github.com/facebook/react/blob/main/packages/react-dom/src/shared/omittedCloseTags.js#L11-L28
 */

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean,
): (key: string) => boolean {
  const map = Object.create(null) as Record<string, boolean>
  const list: string[] = str.split(',')
  for (const element of list) {
    map[element] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const VOID_TAGS =
  'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'

export const isVoidTag = /* #__PURE__ */ makeMap(VOID_TAGS)
