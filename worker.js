// @ts-check

const { runAsWorker } = require('synckit')

runAsWorker(async (code, filePath) => {
  const { parseTemplate } = await import('@angular/compiler')
  return parseTemplate(code, filePath, {
    preserveWhitespaces: true,
    preserveLineEndings: true,
    collectCommentNodes: true,
  })
})
