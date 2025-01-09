<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleCreate"> {{ t('pages.apisixGlobalRule.create') }} </t-button>
          <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length">
            {{ t('pages.apisixGlobalRule.export') }}</t-button
          >
          <p v-if="!!selectedRowKeys.length" class="selected-count">
            {{ t('pages.apisixGlobalRule.selectedCount', { num: selectedRowKeys.length }) }}
          </p>
        </div>
        <div class="search-input">
          <t-input v-model="searchValue" :placeholder="t('pages.apisixGlobalRule.placeholder')" clearable>
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
        </div>
      </t-row>
      <t-table
        v-model:displayColumns="displayColumns"
        :data="data"
        :columns="COLUMNS"
        :column-controller="columnControllerConfig"
        :row-key="rowKey"
        vertical-align="top"
        :hover="true"
        :pagination="pagination"
        :selected-row-keys="selectedRowKeys"
        :loading="dataLoading"
        :header-affixed-top="headerAffixedTop"
        table-layout="auto"
        @page-change="rehandlePageChange"
        @change="rehandleChange"
        @select-change="(value: string[]) => rehandleSelectChange(value)"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #value.plugins="{ row }">
          <t-space size="small">
            <t-tag v-for="(value, key) in row.value.plugins" :key="key" variant="light-outline">
              {{ key }}
            </t-tag>
          </t-space>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #value.create_time="{ row }">
          {{ dayjs.unix(row.value.create_time).format('L LT') }}
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #value.update_time="{ row }">
          {{ dayjs.unix(row.value.update_time).format('L LT') }}
        </template>

        <template #op="slotProps: BaseTableCellParams<Item>">
          <t-space>
            <t-link theme="primary" @click="handleClickView(slotProps)">
              {{ t('pages.apisixGlobalRule.operations.view') }}</t-link
            >
            <t-link theme="primary" @click="handleClickEdit(slotProps)">
              {{ t('pages.apisixGlobalRule.operations.edit') }}</t-link
            >
            <t-link theme="danger" @click="handleClickDelete(slotProps)">
              {{ t('pages.apisixGlobalRule.operations.delete') }}</t-link
            >
          </t-space>
        </template>
      </t-table>
    </t-card>

    <t-dialog
      v-model:visible="confirmVisible"
      :header="t('pages.apisixGlobalRule.deleteConfirm.header')"
      :on-cancel="onCancel"
      @confirm="onConfirmDelete"
    >
      <p v-if="deleteIdx.length === 1">
        {{
          t('pages.apisixGlobalRule.deleteConfirm.deleteOne', {
            name: data[deleteIdx[0]]?.value?.id,
          })
        }}
      </p>
      <p v-if="deleteIdx.length > 1">
        {{
          t('pages.apisixGlobalRule.deleteConfirm.deleteMulti', {
            name: data[deleteIdx[0]]?.value?.id,
            num: deleteIdx.length,
          })
        }}
      </p>
    </t-dialog>

    <t-drawer v-model:visible="drawerVisible" :header="drawerHeader" :on-confirm="onDrawerClickConfirm" size="medium">
      <code-editor v-model:value="drawerBody" language="json" />
    </t-drawer>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ApisixGlobalRule',
};
</script>

<script setup lang="ts">
import { AxiosPromise } from 'axios';
import dayjs from 'dayjs';
import { SearchIcon } from 'tdesign-icons-vue-next';
import { BaseTableCellParams, MessagePlugin, PrimaryTableCol, TableProps, TableRowData } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { GlobalRuleApi } from '@/api/apisix/admin';
import {
  ApisixAdminGlobalRulesGet200ResponseListInner as Item,
  ApisixAdminRoutesIdDelete200Response,
} from '@/api/apisix/admin/typescript-axios';
import CodeEditor from '@/components/code-editor/index.vue';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const store = useSettingStore();

const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: t('pages.apisixGlobalRule.root.key'),
    colKey: 'key',
    fixed: 'left',
  },
  {
    title: t('pages.apisixGlobalRule.root.createdIndex'),
    colKey: 'createdIndex',
    fixed: 'left',
  },
  {
    title: t('pages.apisixGlobalRule.root.modifiedIndex'),
    colKey: 'modifiedIndex',
    fixed: 'left',
  },
  {
    title: t('pages.apisixGlobalRule.value.id'),
    colKey: 'value.id',
    fixed: 'left',
  },
  {
    title: t('pages.apisixGlobalRule.value.plugins'),
    colKey: 'value.plugins',
  },
  {
    title: t('pages.apisixGlobalRule.value.create_time'),
    colKey: 'value.create_time',
    width: 240,
  },
  {
    title: t('pages.apisixGlobalRule.value.update_time'),
    colKey: 'value.update_time',
    width: 240,
  },
  {
    title: t('pages.apisixGlobalRule.operation'),
    align: 'left',
    fixed: 'right',
    colKey: 'op',
    width: 160,
  },
];
const staticColumn: string[] = ['row-select', 'op'];
const displayColumns = ref<TableProps['displayColumns']>(
  staticColumn.concat(['value.id', 'value.desc', 'value.content']),
);
const columnControllerConfig = computed<TableProps['columnController']>(() => ({
  // 列配置按钮位置
  placement: 'top-right',
  // 用于设置允许用户对哪些列进行显示或隐藏的控制，默认为全部字段
  fields: undefined,
  // 弹框组件属性透传
  dialogProps: {
    preventScrollThrough: true,
  },
  // 列配置按钮组件属性透传
  buttonProps: undefined,
  // 数据字段分组显示
  groupColumns: [
    {
      label: 'root',
      value: 'root',
      columns: ['key', 'createdIndex', 'modifiedIndex'],
    },
    {
      label: 'value',
      value: 'value',
      columns: ['value.id', 'value.plugins', 'value.create_time', 'value.update_time'],
    },
  ],
}));

const data = ref<Item[]>([]);
const pagination = ref({
  defaultPageSize: 20,
  total: 100,
  defaultCurrent: 1,
});

const searchValue = ref('');

const dataLoading = ref(false);
const fetchData = async () => {
  dataLoading.value = true;
  try {
    const res = await GlobalRuleApi.apisixAdminGlobalRulesGet({
      params: {
        page: pagination.value.defaultCurrent,
        page_size: pagination.value.defaultPageSize,
      },
    });
    let { list } = res.data;
    // fix: when apisix returns list as {}
    if (!(list instanceof Array)) {
      list = [];
    }

    data.value = list;
    pagination.value = {
      ...pagination.value,
      total: list.length,
    };
  } catch (e) {
    console.error(e);
  }
  dataLoading.value = false;
};

const deleteIdx = ref<number[]>([]);

onMounted(() => {
  fetchData();
});

const confirmVisible = ref(false);

const selectedRowKeys = ref<string[]>([]);

const router = useRouter();

const resetIdx = () => {
  deleteIdx.value = [];
};

const onConfirmDelete = async () => {
  // 真实业务请发起请求
  const ps: AxiosPromise<ApisixAdminRoutesIdDelete200Response>[] = [];
  deleteIdx.value.forEach((rowIndex) => {
    const { id } = data.value[rowIndex].value;
    const p = GlobalRuleApi.apisixAdminGlobalRulesIdDelete({
      id: id.toString(), // fix: apisix openapi
      force: 'false',
    });
    ps.push(p);
  });
  const resArr = await Promise.all(ps);

  const successResArr = resArr.filter((res) => {
    return res.status === 200 && res.data.deleted;
  });

  resetIdx();
  confirmVisible.value = false;
  MessagePlugin.success(t('pages.apisixGlobalRule.deleteMessage.success', { num: successResArr.length }));

  await fetchData();
};

const onCancel = () => {
  resetIdx();
};

const rowKey = 'key';

const rehandleSelectChange = (val: string[]) => {
  selectedRowKeys.value = val;
};
const rehandlePageChange = (curr: unknown, pageInfo: unknown) => {
  console.log('分页变化', curr, pageInfo);
};
const rehandleChange = (changeParams: unknown, triggerAndData: unknown) => {
  console.log('统一Change', changeParams, triggerAndData);
};
const handleClickView = (slotProps: BaseTableCellParams<Item>) => {
  drawerHeader.value = slotProps.row.value.id.toString(); // fix: apisix openapi
  drawerBody.value = JSON.stringify(slotProps.row.value, null, 2);
  drawerVisible.value = true;
};
const handleClickEdit = (slotProps: BaseTableCellParams<Item>) => {
  router.push(`/apisix/globalRule/edit?id=${slotProps.row.value.id}`);
};
const handleCreate = () => {
  router.push('/apisix/globalRule/edit');
};
const handleClickDelete = (slotProps: BaseTableCellParams<Item>) => {
  deleteIdx.value = [slotProps.rowIndex];
  confirmVisible.value = true;
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const drawerVisible = ref(false);
const drawerHeader = ref('');
const drawerBody = ref('');

const onDrawerClickConfirm = () => {
  MessagePlugin.info('数据保存中...', 1000);
  const timer = setTimeout(() => {
    clearTimeout(timer);
    drawerVisible.value = false;
    MessagePlugin.info('数据保存成功!');
  }, 1000);
};
</script>

<style lang="less" scoped>
.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: var(--td-comp-margin-s);
  }
}

.list-card-container {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.left-operation-container {
  display: flex;
  align-items: center;
  margin-bottom: var(--td-comp-margin-xxl);

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-l);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}
</style>
