import merge from 'lodash/merge';
import { FormRule } from 'tdesign-vue-next';

export const FORM_RULES_1: Record<string, FormRule[]> = {
  username: [{ required: true, whitespace: true, type: 'error' }],
  desc: [{ validator: (val) => (val ?? '').length <= 256, type: 'error' }],
};

export const FORM_RULES_2: Record<string, FormRule[]> = merge({}, FORM_RULES_1, {});
export const FORM_RULES_3: Record<string, FormRule[]> = merge({}, FORM_RULES_1, {});
