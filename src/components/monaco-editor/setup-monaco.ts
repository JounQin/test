import './monaco-env'

export const setupMonaco = async () => {
  const monaco = await import('monaco-editor/esm/vs/editor/edcore.main')

  window.monaco = monaco

  await Promise.all([
    import('monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'),
    import('monaco-yaml/lib/esm/monaco.contribution'),
  ])

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  monaco.languages.yaml.yamlDefaults.setDiagnosticsOptions({
    enableSchemaRequest: true,
    format: true,
    validate: true,
  })

  return monaco
}
