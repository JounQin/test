import { raw } from 'hast-util-raw'
import { h } from 'hastscript'

const result = raw(
  h('p', [
    Object.assign(
      h('code', {
        meta: 'title="Hello World"',
      }),
      {
        data: {
          meta: 'title="Hello World"',
        },
      },
    ),
  ]),
)

console.log(JSON.stringify(result, null, 2))
