export const setupMonaco = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window.monaco) {
    return window.monaco
  }

  const [{ default: EditorWorker }, { default: YamlWorker }] =
    await Promise.all([
      import('monaco-editor/esm/vs/editor/editor.worker?worker'),
      import('monaco-yaml/lib/esm/yaml.worker?worker'),
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

  window.monaco = monaco

  const [, { setDiagnosticsOptions }] = await Promise.all([
    import('monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'),
    import('monaco-yaml'),
  ])

  setDiagnosticsOptions({
    enableSchemaRequest: true,
    format: true,
    validate: true,
  })

  return monaco
}
