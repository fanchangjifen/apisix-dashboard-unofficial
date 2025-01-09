<template>
  <t-form :data="root" :rules="FORM_RULES" @submit="onSubmit">
    <t-form-item :label="t('components.apisixUpstreamForm.name')" name="name">
      <t-input
        v-model="root.name"
        :style="{ width: '480px' }"
        :placeholder="t('components.apisixUpstreamForm.namePlaceholder')"
      />
    </t-form-item>
    <t-form-item :label="t('components.apisixUpstreamForm.desc')" name="desc">
      <t-input
        v-model="root.desc"
        :style="{ width: '480px' }"
        :placeholder="t('components.apisixUpstreamForm.descPlaceholder')"
      />
    </t-form-item>

    <t-form-item :label="t('components.apisixUpstreamForm.upstreamType')" name="upstreamType">
      <t-radio-group v-model="upstreamType">
        <t-radio-button
          v-for="(item, index) in UPSTREAM_TYPE_OPTIONS"
          :key="index"
          :label="item"
          :value="Number(index)"
        />
      </t-radio-group>
    </t-form-item>

    <t-form-item
      v-if="upstreamType === UPSTREAM_TYPE.NODES"
      :label="t('components.apisixUpstreamForm.nodes')"
      name="nodes"
    >
      <!-- 这个div是转换成block -->
      <div>
        <t-form
          v-for="(
            nodeItem, index
          ) in normalzedNodes as ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner[]"
          :key="index"
          :ref="(ref) => (nodesForms[index] = ref as unknown as FormInstanceFunctions)"
          style="margin-bottom: var(--td-comp-margin-xxl)"
          layout="inline"
          :data="nodeItem"
          :rules="UPSTREAM_NODES_RULE"
          class="nodesForm"
        >
          <t-form-item :label="t('components.apisixUpstreamForm.nodesInner.host')" name="host">
            <t-input
              v-model="nodeItem.host"
              :placeholder="t('components.apisixUpstreamForm.nodesInner.hostPlaceholder')"
            />
          </t-form-item>
          <t-form-item :label="t('components.apisixUpstreamForm.nodesInner.port')" name="port">
            <t-input-number
              v-model="nodeItem.port"
              theme="normal"
              :placeholder="t('components.apisixUpstreamForm.nodesInner.portPlaceholder')"
              min="1"
              max="65535"
            />
          </t-form-item>
          <t-form-item :label="t('components.apisixUpstreamForm.nodesInner.weight')" name="weight">
            <t-input-number
              v-model="nodeItem.weight"
              theme="normal"
              :placeholder="t('components.apisixUpstreamForm.nodesInner.weightPlaceholder')"
              min="0"
            />
          </t-form-item>
          <t-button theme="danger" style="margin-left: var(--td-comp-margin-xxl)" @click="onRemoveUpstreamNode(index)">
            {{ t('components.apisixUpstreamForm.removeNode') }}
          </t-button>
        </t-form>
        <t-button @click="onAddUpstreamNode">
          {{ t('components.apisixUpstreamForm.addNode') }}
        </t-button>
      </div>
    </t-form-item>

    <t-form-item
      v-if="upstreamType === UPSTREAM_TYPE.DISCOVERY"
      :label="t('components.apisixUpstreamForm.discovery_type')"
      name="discovery_type"
    >
      <enum-select-input
        v-model="root.discovery_type"
        clearable
        allow-input
        :style="{ width: '480px' }"
        :options="Object.values(DISCOVERY_TYPE)"
      />
    </t-form-item>

    <t-form-item
      v-if="upstreamType === UPSTREAM_TYPE.DISCOVERY"
      :label="t('components.apisixUpstreamForm.service_name')"
      name="service_name"
    >
      <t-input
        v-model="root.service_name"
        :style="{ width: '480px' }"
        :placeholder="t('components.apisixUpstreamForm.service_namePlaceholder')"
      />
    </t-form-item>
    <slot></slot>
  </t-form>
</template>

<script setup lang="ts">
import { FormInstanceFunctions, SubmitContext } from 'tdesign-vue-next';
import { computed, PropType, ref } from 'vue';

import {
  ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodes,
  ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner,
  ApisixAdminRoutesPostRequestUpstream,
} from '@/api/apisix/admin/typescript-axios';
import EnumSelectInput from '@/components/enum-select-input/index.vue';
import { t } from '@/locales';

import { DISCOVERY_TYPE, FORM_RULES, UPSTREAM_NODES_RULE, UPSTREAM_TYPE, UPSTREAM_TYPE_OPTIONS } from './constants';

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<{
  submit: [result: SubmitContext];
}>();

const root = defineModel({
  type: Object as PropType<ApisixAdminRoutesPostRequestUpstream>,
  default: {},
});

const nodesForms = ref<FormInstanceFunctions[]>([]);

const normalzedNodes = computed<ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner[]>({
  get: () => {
    if (!root.value.nodes) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      root.value.nodes = [];
    }

    // cast to array
    if (root.value.nodes instanceof Array) {
      return root.value.nodes;
    }
    const newNodes = [];
    for (const key in root.value.nodes as Record<string, number>) {
      const [host, port] = key.split(':');
      // Record<url, weight>
      const item: ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner = {
        weight: (root.value.nodes as Record<string, number>)[key],
        port: port ? Number.parseInt(port, 10) : undefined,
        host,
      };
      newNodes.push(item);
    }

    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    root.value.nodes = newNodes;

    return root.value.nodes as ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner[];
  },
  set: (val: ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodesAnyOfInner[]) => {
    root.value.nodes = val as ApisixAdminRoutesGet200ResponseListInnerValueUpstreamNodes;
  },
});

const upstreamType = ref<UPSTREAM_TYPE>(UPSTREAM_TYPE.NODES);

const onAddUpstreamNode = () => {
  normalzedNodes.value.push({
    weight: 1,
    port: 80,
    host: '',
  });
};
const onRemoveUpstreamNode = (i: number) => {
  normalzedNodes.value.splice(i, 1);
};

const onSubmit = async (result: SubmitContext) => {
  console.debug('ApisixUpstreamForm onSubmit validation', result);

  delete (root.value as any).create_time;
  delete (root.value as any).update_time;

  if (upstreamType.value === UPSTREAM_TYPE.NODES) {
    delete root.value.discovery_type;
    delete root.value.service_name;
    for (const index in nodesForms.value) {
      // eslint-disable-next-line no-await-in-loop
      const validateResult = await nodesForms.value[index].validate({ showErrorMessage: true });
      if (validateResult !== true) {
        return;
      }
    }
  }

  if (upstreamType.value === UPSTREAM_TYPE.DISCOVERY) {
    delete root.value.nodes;
  }

  emit('submit', result);
};
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="less">
// 修复在form嵌套时的校验错误样式
.nodesForm {
  .t-is-error {
    .t-input {
      &__extra {
        color: var(--td-error-color);
      }
    }
  }
}
</style>
