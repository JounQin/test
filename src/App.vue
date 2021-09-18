<template>
  <MonacoEditor
    class="editor-container"
    language="yaml"
    :value="value"
    @editorChange="onEditorChange"
  ></MonacoEditor>
</template>
<script lang="ts" setup>
import type { editor } from 'monaco-editor'

import { MonacoEditor } from './components'

const value = /* YAML */ `
containers:
  - name: nginx
    ports:
      - containerPort: 80
`.trimStart()

const onEditorChange = async (editor: editor.IStandaloneCodeEditor) => {
  const { getDocumentSymbols } = await import(
    'monaco-editor/esm/vs/editor/contrib/documentSymbols/documentSymbols'
  )

  editor.onDidChangeCursorSelection(async () => {
    const model = editor.getModel()
    console.log('model:', model)
    const symbols = await getDocumentSymbols(model!, true, {
      isCancellationRequested: false,
      onCancellationRequested: () => ({
        dispose() {
          //
        },
      }),
    })
    console.log(symbols)
  })
}
</script>
<style src="normalize.css/normalize.css"></style>
<style lang="scss">
.editor-container {
  height: 100vh;
}
</style>
