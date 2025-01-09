import merge from 'lodash/merge';
import { FormRule } from 'tdesign-vue-next';

import { t } from '@/locales';

export const FORM_RULES_1: Record<string, FormRule[]> = {
  secretmanager: [{ required: true, type: 'error' }],
  id: [{ required: true, type: 'error' }],
  uri: [{ required: true, type: 'error' }],
  prefix: [{ required: true, type: 'error' }],
  token: [{ required: true, type: 'error' }],
};

export const FORM_RULES_2: Record<string, FormRule[]> = merge({}, FORM_RULES_1, {});

export enum SECRETMANAGER {
  VAULT = 'vault',
  AWS = 'aws',
}
export const SECRETMANAGER_OPTIONS: Record<SECRETMANAGER, string> = {
  [SECRETMANAGER.VAULT]: t('pages.apisixSecretEdit.secretmanagerEnum.vault'),
  [SECRETMANAGER.AWS]: t('components.apisixSecretEdit.secretmanagerEnum.consul'),
};
