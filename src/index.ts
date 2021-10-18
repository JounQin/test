import type { ParsedTemplate } from '@angular/compiler'
import { createSyncFn } from 'synckit'

const parseTemplate = createSyncFn<
  (code: string, filePath: string) => Promise<ParsedTemplate>
>(require.resolve('../worker'))

console.log(
  parseTemplate(
    /* HTML */ `
      <!-- eslint-disable-next-line -->
      <div>some node</div>
      <!-- some other comment -->
    `,
    './foo.html',
  ),
)
