import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import YamlWorker from 'monaco-yaml/lib/esm/yaml.worker?worker'

window.MonacoEnvironment = {
  globalAPI: true,
  getWorker(_: string, label: string) {
    console.log(_, label)
    if (label === 'yaml') {
      return new YamlWorker()
    }
    return new EditorWorker()
  },
}
