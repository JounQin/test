<template>
  <div ref="elRef"></div>
</template>
<script lang="ts" setup>
import { onMounted } from '@vue/runtime-core'
import type { editor } from 'monaco-editor'
import { defineEmits, defineProps, ref } from 'vue'

import { setupMonaco } from './setup-monaco'

const emit = defineEmits(['editorChange'])

const props = defineProps<{
  language: string
  value: string
  options?: Omit<
    editor.IStandaloneEditorConstructionOptions,
    'language' | 'value'
  >
}>()

const elRef = ref<HTMLElement>()

onMounted(async () => {
  const monaco = await setupMonaco()

  const editorIns = monaco.editor.create(elRef.value!, {
    language: props.language,
    value: props.value,
    ...props.options,
  })

  emit('editorChange', editorIns)
})
</script>
<style src="monaco-editor/min/vs/editor/editor.main.css"></style>
