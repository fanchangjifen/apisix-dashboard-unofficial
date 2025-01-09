<template>
  <t-loading :loading="loading" style="height: 100%; width: 100%">
    <vue-monaco-editor
      v-model:value="code"
      :options="props.options"
      :language="language"
      theme="vs-dark"
      style="height: 500px"
      @mount="handleMount"
      @change="(value: string) => $emit('change', value)"
    />
  </t-loading>
</template>

<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import * as MonacoEditor from 'monaco-editor';
import { PropType, ref, shallowRef } from 'vue';

defineOptions({
  inheritAttrs: false,
});

defineEmits<{
  change: [value: string];
}>();

const props = defineProps({
  options: {
    type: Object as PropType<MonacoEditor.editor.IStandaloneEditorConstructionOptions>,
  },
  language: {
    type: String,
  },
});

const code = defineModel('value', {
  type: String,
  default: '',
  local: false,
});
const loading = ref(false);

const editorRef = shallowRef<MonacoEditor.editor.ICodeEditor>();
const handleMount = (editor: MonacoEditor.editor.ICodeEditor) => {
  editorRef.value = editor;
};

const format = () => {
  return editorRef.value?.getAction('editor.action.formatDocument').run();
};

const loadJson = async (obj: any, formatCode?: boolean) => {
  loading.value = true;
  code.value = JSON.stringify(obj, null, 2); // 如果是readOnly是无法格式化的，所以这里先简单格式化一下
  if (formatCode) {
    await format();
  }
  loading.value = false;
};

const parseJson = () => {
  loading.value = true;
  const obj = JSON.parse(code.value);
  loading.value = false;
  return obj;
};

defineExpose({
  format,
  loadJson,
  parseJson,
});
</script>

<style lang="less" scoped></style>
