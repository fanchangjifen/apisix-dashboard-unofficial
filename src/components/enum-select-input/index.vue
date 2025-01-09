<template>
  <t-select-input
    :value="model"
    :popup-visible="popupVisible"
    @popup-visible-change="onPopupVisibleChange"
    @input-change="onInputChange"
  >
    <template #panel>
      <ul class="tdesign-demo__select-input-ul-single">
        <li v-for="item in props.options" :key="item" @click="() => onOptionClick(item)">
          {{ item }}
        </li>
      </ul>
    </template>
    <template #suffixIcon>
      <chevron-down-icon />
    </template>
  </t-select-input>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from 'tdesign-icons-vue-next';
import { SelectInputProps } from 'tdesign-vue-next';
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array<any>,
  },
});
const model = defineModel({ type: String });

const popupVisible = ref(false);
const onPopupVisibleChange: SelectInputProps['onPopupVisibleChange'] = (val, _context) => {
  popupVisible.value = val;
};
const onInputChange: SelectInputProps['onInputChange'] = (val, _context) => {
  model.value = val;
};
const onOptionClick = (item: any) => {
  model.value = item;
  // 选中后立即关闭浮层
  popupVisible.value = false;
};
</script>

<style lang="less" scoped>
.tdesign-demo__select-input-ul-single {
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 2px;
}

.tdesign-demo__select-input-ul-single > li {
  display: block;
  border-radius: 3px;
  line-height: 22px;
  cursor: pointer;
  padding: 3px 8px;
  color: var(--td-text-color-primary);
  transition: background-color 0.2s linear;
  white-space: nowrap;
  word-wrap: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tdesign-demo__select-input-ul-single > li:hover {
  background-color: var(--td-bg-color-container-hover);
}
</style>
