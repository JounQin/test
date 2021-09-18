/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'

  const Component: DefineComponent

  export default Component
}

declare module 'monaco-editor/esm/vs/editor/contrib/documentSymbols/documentSymbols' {
  import type { CancellationToken, editor, languages } from 'monaco-editor'

  export function getDocumentSymbols(
    document: editor.ITextModel,
    flat: boolean,
    token: CancellationToken,
  ): Promise<languages.DocumentSymbol[]>
}

declare module 'monaco-editor/esm/vs/editor/edcore.main' {
  const monaco: typeof import('monaco-editor')
  export = monaco
}

declare module 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution' {}

declare interface Window {
  monaco: typeof import('monaco-editor')
  MonacoEnvironment: import('monaco-editor').Environment
}
