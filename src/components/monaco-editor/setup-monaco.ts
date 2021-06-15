/// <reference types="monaco-yaml/lib/monaco" />

import './monaco-env'

export const setupMonaco = async () => {
  const monaco = await import('monaco-editor/esm/vs/editor/edcore.main')

  // @ts-expect-error
  window.monaco = monaco

  await Promise.all([
    import('monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'),
    import('monaco-yaml/lib/esm/monaco.contribution'),
  ])

  window.monaco.languages.yaml.yamlDefaults.setDiagnosticsOptions({
    enableSchemaRequest: true,
    format: true,
    validate: true,
  })

  return monaco
}
