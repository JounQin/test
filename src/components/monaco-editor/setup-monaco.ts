/// <reference types="monaco-yaml/lib/monaco" />

export const setupMonaco = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window.monaco) {
    return window.monaco
  }

  const [{ default: EditorWorker }, { default: YamlWorker }] =
    await Promise.all([
      // eslint-disable-next-line import/no-unresolved, import/no-webpack-loader-syntax
      import('worker-loader!monaco-editor/esm/vs/editor/editor.worker'),
      import('monaco-yaml/lib/esm/yaml.worker'),
    ])

  window.MonacoEnvironment = {
    globalAPI: true,
    getWorker(_: string, label: string) {
      if (label === 'yaml') {
        return new YamlWorker()
      }
      return new EditorWorker()
    },
  }

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
