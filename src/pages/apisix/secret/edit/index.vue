<template>
  <div>
    <div class="form-step-container">
      <t-loading :loading="dataLoading" show-overlay>
        <!-- 简单步骤条 -->
        <t-card :bordered="false">
          <t-steps class="step-container" :current="activeStep - 1" status="process">
            <t-step-item
              :title="t('pages.apisixSecretEdit.step1.title')"
              :content="t('pages.apisixSecretEdit.step1.subtitle')"
            />
            <t-step-item
              :title="t('pages.apisixSecretEdit.step2.title')"
              :content="t('pages.apisixSecretEdit.step2.subtitle')"
            />
            <t-step-item
              :title="t('pages.apisixSecretEdit.step3.title')"
              :content="t('pages.apisixSecretEdit.step3.subtitle')"
            />
          </t-steps>
        </t-card>

        <!-- 分步表单1 设置路由信息 -->
        <t-divider align="left">{{ t('pages.apisixSecretEdit.step1.basic') }}</t-divider>

        <t-form v-show="activeStep === 1" class="step-form" :data="formData" :rules="FORM_RULES_1" @submit="onNextStep">
          <t-form-item :label="t('pages.apisixSecretEdit.step1.secretmanager')" name="secretmanager">
            <enum-select-input
              v-model="formData.secretmanager"
              clearable
              allow-input
              :placeholder="t('pages.apisixSecretEdit.step1.secretmanagerPlaceholder')"
              :style="{ width: '480px' }"
              :options="Object.values(SECRETMANAGER)"
              :disabled="editSecretmanager ? true : false"
            />
          </t-form-item>

          <t-form-item :label="t('pages.apisixSecretEdit.step1.id')" name="id">
            <t-input
              v-model="formData.id"
              :style="{ width: '480px' }"
              :placeholder="t('pages.apisixSecretEdit.step1.idPlaceholder')"
              :disabled="editId ? true : false"
            />
          </t-form-item>

          <t-form-item :label="t('pages.apisixSecretEdit.step1.uri')" name="uri">
            <t-input
              v-model="formData.uri"
              :style="{ width: '480px' }"
              :placeholder="t('pages.apisixSecretEdit.step1.uriPlaceholder')"
            />
          </t-form-item>

          <t-form-item :label="t('pages.apisixSecretEdit.step1.prefix')" name="prefix">
            <t-input
              v-model="formData.prefix"
              :style="{ width: '480px' }"
              :placeholder="t('pages.apisixSecretEdit.step1.prefixPlaceholder')"
            />
          </t-form-item>

          <t-form-item :label="t('pages.apisixSecretEdit.step1.token')" name="token">
            <t-input
              v-model="formData.token"
              :style="{ width: '480px' }"
              :placeholder="t('pages.apisixSecretEdit.step1.tokenPlaceholder')"
            />
          </t-form-item>

          <t-form-item>
            <t-button disabled theme="default" variant="base" @click="onPreStep">
              {{ t('pages.apisixSecretEdit.preStep') }}
            </t-button>
            <t-button type="submit" theme="primary"> {{ t('pages.apisixSecretEdit.nextStep') }} </t-button>
          </t-form-item>
        </t-form>

        <!-- 分步表单2 预览 -->
        <t-form v-show="activeStep === 2" class="step-form" :data="formData" :rules="FORM_RULES_2" @submit="onSubmit">
          <t-form-item :label="t('pages.apisixSecretEdit.step2.title')">
            <code-editor
              ref="previewEditorRef"
              v-model:value="previewEditorData"
              language="json"
              :options="{ readOnly: true }"
            />
          </t-form-item>
          <t-form-item>
            <t-button theme="default" variant="base" @click="onPreStep">{{
              t('pages.apisixSecretEdit.preStep')
            }}</t-button>
            <t-button type="submit" theme="primary"> {{ t('pages.apisixSecretEdit.submit') }} </t-button>
          </t-form-item>
        </t-form>

        <!-- 分步表单3 完成 -->
        <div v-show="activeStep === 3" class="result-success">
          <t-icon class="result-success-icon" name="check-circle" />
          <div class="result-success-title">{{ t('pages.apisixSecretEdit.step3.successTitle') }}</div>
          <div class="result-success-describe">{{ t('pages.apisixSecretEdit.step3.successDescribe') }}</div>
          <div>
            <t-button @click="onComplete">
              {{ t('pages.apisixSecretEdit.step3.complete') }}
            </t-button>
            <t-button theme="default" @click="onReapply">
              {{ t('pages.apisixSecretEdit.step3.reapply') }}
            </t-button>
          </div>
        </div>
      </t-loading>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ApisixSecretEdit',
};
</script>

<script setup lang="ts">
import { AxiosError, AxiosResponse } from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { onActivated, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { SecretApi } from '@/api/apisix/admin';
import {
  ApisixAdminRoutesPost201Response,
  ApisixAdminSecretsSecretmanagerIdPutRequest,
  SecretApiApisixAdminSecretsSecretmanagerIdPutRequest,
} from '@/api/apisix/admin/typescript-axios';
import CodeEditor from '@/components/code-editor/index.vue';
import EnumSelectInput from '@/components/enum-select-input/index.vue';
import { t } from '@/locales';

import { FORM_RULES_1, FORM_RULES_2, SECRETMANAGER } from './constants';

type FORM_DATA_SCHEMA = ApisixAdminSecretsSecretmanagerIdPutRequest & { secretmanager: string; id: string };

let INITIAL_DATA: FORM_DATA_SCHEMA = {
  uri: '',
  prefix: '',
  token: '',

  secretmanager: '',
  id: '',
};

const editSecretmanager = ref<string | undefined>(undefined);
const editId = ref<string | undefined>(undefined);

const formData = ref<FORM_DATA_SCHEMA>(INITIAL_DATA);
const activeStep = ref(1);

const router = useRouter();

onActivated(async () => {
  onReset();

  if (!router.currentRoute.value.query.secretmanager) {
    return;
  }
  if (!router.currentRoute.value.query.id) {
    return;
  }
  const secretmanager = router.currentRoute.value.query.secretmanager.toString();
  const id = router.currentRoute.value.query.id.toString();
  fetchData(secretmanager, id);
});

const dataLoading = ref(false);
const fetchData = async (secretmanager: string, id: string) => {
  dataLoading.value = true;
  try {
    const res = await SecretApi.apisixAdminSecretsSecretmanagerIdGet({
      secretmanager,
      id,
    });
    INITIAL_DATA = merge({}, res.data.value, { secretmanager, id });
    formData.value = cloneDeep(INITIAL_DATA);

    editSecretmanager.value = secretmanager;
    editId.value = id;
  } catch (e) {
    console.error(e);
  }
  dataLoading.value = false;
};

const onNextStep = (result: SubmitContext) => {
  console.debug('ApisixSecretEdit onNextStep validation', result);
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
  INITIAL_DATA = {
    uri: '',
    prefix: '',
    token: '',

    secretmanager: '',
    id: '',
  };
  formData.value = cloneDeep(INITIAL_DATA);
  editSecretmanager.value = undefined;
  editId.value = undefined;
};
const onReapply = () => {
  onReset();
  router.replace({ query: null }); // clean query id
};
const onSubmit = async (result: SubmitContext) => {
  console.debug('ApisixSecretEdit onSubmit validation', result);
  if (result.validateResult !== true) {
    return;
  }

  delete (formData.value as any).create_time;
  delete (formData.value as any).update_time;

  dataLoading.value = true;
  let res: AxiosResponse<ApisixAdminRoutesPost201Response>;
  try {
    if (editId.value && editSecretmanager.value) {
      res = await update();
    } else {
      res = await create();
    }
    onNextStep(result);
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response.data.error_msg) {
        MessagePlugin.error(t('pages.apisixSecretEdit.submitError', { message: e.response.data.error_msg }));
      }
    }
    console.error(e);
  }
  dataLoading.value = false;
};
// secretmanager和id是PathParam，不在body内，需要过滤
const formToReqBody = (form: FORM_DATA_SCHEMA) => {
  const body = cloneDeep(form);
  delete body.secretmanager;
  delete body.id;
  return body;
};
const create = () => {
  const req: SecretApiApisixAdminSecretsSecretmanagerIdPutRequest = {
    secretmanager: formData.value.secretmanager,
    id: formData.value.id,
    apisixAdminSecretsSecretmanagerIdPutRequest: formToReqBody(formData.value),
  };
  return SecretApi.apisixAdminSecretsSecretmanagerIdPut(req);
};
const update = () => {
  const req: SecretApiApisixAdminSecretsSecretmanagerIdPutRequest = {
    secretmanager: formData.value.secretmanager,
    id: formData.value.id,
    apisixAdminSecretsSecretmanagerIdPutRequest: formToReqBody(formData.value),
  };
  return SecretApi.apisixAdminSecretsSecretmanagerIdPut(req);
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
