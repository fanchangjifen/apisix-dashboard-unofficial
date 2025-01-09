import merge from 'lodash/merge';
import { FormRule } from 'tdesign-vue-next';

export const FORM_RULES_1: Record<string, FormRule[]> = {
  uri: [{ required: true, type: 'error' }],
};

export const FORM_RULES_2: Record<string, FormRule[]> = merge({}, FORM_RULES_1, {});
export const FORM_RULES_3: Record<string, FormRule[]> = merge({}, FORM_RULES_1, {});

export const METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' },
  { label: 'CONNECT', value: 'CONNECT' },
  { label: 'TRACE', value: 'TRACE' },
  { label: 'PURGE', value: 'PURGE' },
];
