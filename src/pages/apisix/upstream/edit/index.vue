<template>
  <div>
    <div class="form-step-container">
      <t-loading :loading="dataLoading" show-overlay>
        <!-- 简单步骤条 -->
        <t-card :bordered="false">
          <t-steps class="step-container" :current="activeStep - 1" status="process">
            <t-step-item
              :title="t('pages.apisixUpstreamEdit.step1.title')"
              :content="t('pages.apisixUpstreamEdit.step1.subtitle')"
            />
            <t-step-item
              :title="t('pages.apisixUpstreamEdit.step2.title')"
              :content="t('pages.apisixUpstreamEdit.step2.subtitle')"
            />
            <t-step-item
              :title="t('pages.apisixUpstreamEdit.step3.title')"
              :content="t('pages.apisixUpstreamEdit.step3.subtitle')"
            />
          </t-steps>
        </t-card>

        <!-- 分步表单1 基础信息 -->
        <t-divider align="left">{{ t('pages.apisixUpstreamEdit.step1.basic') }}</t-divider>

        <upstream-form v-show="activeStep === 1" v-model="formData" class="step-form" @submit="onNextStep">
          <t-form-item>
            <t-button disabled theme="default" variant="base" @click="onPreStep">
              {{ t('pages.apisixUpstreamEdit.preStep') }}
            </t-button>
            <t-button type="submit" theme="primary"> {{ t('pages.apisixUpstreamEdit.nextStep') }} </t-button>
          </t-form-item>
        </upstream-form>

        <!-- 分步表单2 预览 -->
        <t-form v-show="activeStep === 2" class="step-form" :data="formData" :rules="FORM_RULES_2" @submit="onSubmit">
          <t-form-item :label="t('pages.apisixUpstreamEdit.step2.title')">
            <code-editor
              ref="previewEditorRef"
              v-model:value="previewEditorData"
              language="json"
              :options="{ readOnly: true }"
            />
          </t-form-item>
          <t-form-item>
            <t-button theme="default" variant="base" @click="onPreStep">{{
              t('pages.apisixUpstreamEdit.preStep')
            }}</t-button>
            <t-button type="submit" theme="primary"> {{ t('pages.apisixUpstreamEdit.submit') }} </t-button>
          </t-form-item>
        </t-form>

        <!-- 分步表单3 完成 -->
        <div v-show="activeStep === 4" class="result-success">
          <t-icon class="result-success-icon" name="check-circle" />
          <div class="result-success-title">{{ t('pages.apisixUpstreamEdit.step3.successTitle') }}</div>
          <div class="result-success-describe">{{ t('pages.apisixUpstreamEdit.step3.successDescribe') }}</div>
          <div>
            <t-button @click="onComplete">
              {{ t('pages.apisixUpstreamEdit.step3.complete') }}
            </t-button>
            <t-button theme="default" @click="onReapply">
              {{ t('pages.apisixUpstreamEdit.step3.reapply') }}
            </t-button>
          </div>
        </div>
      </t-loading>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ApisixUpstreamEdit',
};
</script>

<script setup lang="ts">
import { AxiosError, AxiosResponse } from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import { MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { onActivated, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { UpstreamApi } from '@/api/apisix/admin';
import {
  ApisixAdminRoutesPostRequestUpstream,
  ApisixAdminUpstreamsPost201Response,
  UpstreamApiApisixAdminUpstreamsIdPutRequest,
  UpstreamApiApisixAdminUpstreamsPostRequest,
} from '@/api/apisix/admin/typescript-axios';
import UpstreamForm from '@/components/apisix/upstream-form.vue';
import CodeEditor from '@/components/code-editor/index.vue';
import { t } from '@/locales';

import { FORM_RULES_2 } from './constants';

let INITIAL_DATA: ApisixAdminRoutesPostRequestUpstream = {};

const formData = ref<ApisixAdminRoutesPostRequestUpstream>(INITIAL_DATA);
const activeStep = ref(1);

const router = useRouter();

onActivated(async () => {
  onReset();

  if (!router.currentRoute.value.query.id) {
    return;
  }
  const id = router.currentRoute.value.query.id.toString();
  fetchData(id);
});

const dataLoading = ref(false);
const fetchData = async (id: string) => {
  dataLoading.value = true;
  try {
    const res = await UpstreamApi.apisixAdminUpstreamsIdGet({ id });
    INITIAL_DATA = res.data.value;
    formData.value = cloneDeep(INITIAL_DATA);
  } catch (e) {
    console.error(e);
  }
  dataLoading.value = false;
};

const onNextStep = (result: SubmitContext) => {
  console.debug('ApisixUpstreamEdit onNextStep validation', result);
  if (result.validateResult !== true) {
    return;
  }

  activeStep.value++;
};
const onPreStep = (_e: MouseEvent) => {
  activeStep.value--;
};
const onReset = () => {
  activeStep.value = 1;
  INITIAL_DATA = {};
  formData.value = cloneDeep(INITIAL_DATA);
};
const onReapply = () => {
  onReset();
  router.replace({ query: null }); // clean query id
};
const onSubmit = async (result: SubmitContext) => {
  console.debug('ApisixUpstreamEdit onSubmit validation', result);
  if (result.validateResult !== true) {
    return;
  }

  delete (formData.value as any).create_time;
  delete (formData.value as any).update_time;

  dataLoading.value = true;
  let res: AxiosResponse<ApisixAdminUpstreamsPost201Response>;
  try {
    if (formData.value.id) {
      res = await update();
    } else {
      res = await create();
    }
    onNextStep(result);
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response.data.error_msg) {
        MessagePlugin.error(t('pages.apisixUpstreamEdit.submitError', { message: e.response.data.error_msg }));
      }
    }
    console.error(e);
  }
  dataLoading.value = false;
};
const create = () => {
  const req: UpstreamApiApisixAdminUpstreamsPostRequest = {
    apisixAdminRoutesPostRequestUpstream: formData.value,
  };
  return UpstreamApi.apisixAdminUpstreamsPost(req);
};
const update = () => {
  const req: UpstreamApiApisixAdminUpstreamsIdPutRequest = {
    id: formData.value.id as string,
    apisixAdminRoutesPostRequestUpstream: formData.value,
  };
  return UpstreamApi.apisixAdminUpstreamsIdPut(req);
};
const onComplete = () => {
  router.back();
};
// 配置编辑器
const previewEditorRef = ref<InstanceType<typeof CodeEditor>>();
const previewEditorData = ref('');
watch(activeStep, (newStep, oldStep) => {
  // <!-- 分步表单2 预览 -->
  if (newStep === 2) {
    previewEditorRef.value.loadJson(formData.value, true);
  }
});
</script>

<style lang="less" scoped>
@import './index.less';
</style>
