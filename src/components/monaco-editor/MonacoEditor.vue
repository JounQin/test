<template>
  <div ref="elRef"></div>
</template>
<script lang="ts" setup>
import { onMounted } from '@vue/runtime-core'
import { defineEmit, defineProps, ref } from 'vue'

import { setupMonaco } from './setup-monaco'

const emit = defineEmit(['editorChange'])
const props = defineProps({
  language: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  options: Object,
})

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
