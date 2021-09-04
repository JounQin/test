import type {
  ClassAttributes,
  ComponentType,
  FC,
  ReactElement,
  ReactNode,
} from 'react'
import { Fragment, useState } from 'react'
import rehypeDomParse from 'rehype-dom-parse'
import rehypeReact from 'rehype-react'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import { Loading } from './Loading'

import { useConstant, useEnhancedEffect } from '../hooks'
import { isVoidTag } from '../utils'

/**
 * We're not using `React.createElement` directly because we want to use the new JSX transform
 * @see https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html for more details
 */
export function createElement<T>(
  Element: ComponentType<ClassAttributes<T>> | string,
  props: T,
  ...children: ReactNode[]
): ReactNode {
  if (isVoidTag(Element as string)) {
    return <Element {...props} />
  }
  return <Element {...props}>{children}</Element>
}

export interface RehypeProps {
  children?: string
  markdown?: boolean
  createElement?: typeof createElement
}

export const Rehype: FC<RehypeProps> = ({
  children,
  markdown,
  createElement: _createElement = createElement,
}) => {
  const processor = useConstant(() => {
    let processor = unified()

    processor = markdown
      ? processor.use(remarkParse).use(remarkRehype)
      : processor.use(rehypeDomParse)

    return processor
      .use(rehypeReact, {
        createElement: _createElement,
        Fragment,
      })
      .freeze()
  }, [markdown])

  const [result, setResult] = useState<ReactElement | null>()

  useEnhancedEffect(async () => {
    if (children == null) {
      setResult(null)
    } else {
      const { result } = await processor.process(children)
      setResult(result)
    }
  }, [children, setResult])

  return result === undefined ? <Loading /> : result
}
