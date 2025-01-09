import { FormRule } from 'tdesign-vue-next';

import { t } from '@/locales';

export const FORM_RULES: Record<string, FormRule[]> = {
  nodes: [{ required: true, type: 'error' }],
  discovery_type: [{ required: true, type: 'error' }],
  service_name: [{ required: true, type: 'error' }],
};

export const UPSTREAM_NODES_RULE: Record<string, FormRule[]> = {
  host: [{ required: true, type: 'error' }],
  port: [{ required: true, type: 'error' }],
  weight: [{ required: true, type: 'error' }],
};

export enum UPSTREAM_TYPE {
  NODES,
  DISCOVERY,
}
export const UPSTREAM_TYPE_OPTIONS: Record<UPSTREAM_TYPE, string> = {
  [UPSTREAM_TYPE.NODES]: t('components.apisixUpstreamForm.upstreamTypeInner.nodes'),
  [UPSTREAM_TYPE.DISCOVERY]: t('components.apisixUpstreamForm.upstreamTypeInner.discovery'),
};

export enum DISCOVERY_TYPE {
  DNS = 'dns',
  CONSUL = 'consul',
  CONSUL_KV = 'consul_kv',
  NACOS = 'nacos',
  EUREKA = 'eureka',
  KUBERNETES = 'kubernetes',
}
export const DISCOVERY_TYPE_OPTIONS: Record<DISCOVERY_TYPE, string> = {
  [DISCOVERY_TYPE.DNS]: t('components.apisixUpstreamForm.discoveryTypeInner.dns'),
  [DISCOVERY_TYPE.CONSUL]: t('components.apisixUpstreamForm.discoveryTypeInner.consul'),
  [DISCOVERY_TYPE.CONSUL_KV]: t('components.apisixUpstreamForm.discoveryTypeInner.consul_kv'),
  [DISCOVERY_TYPE.NACOS]: t('components.apisixUpstreamForm.discoveryTypeInner.nacos'),
  [DISCOVERY_TYPE.EUREKA]: t('components.apisixUpstreamForm.discoveryTypeInner.eureka'),
  [DISCOVERY_TYPE.KUBERNETES]: t('components.apisixUpstreamForm.discoveryTypeInner.kubernetes'),
};
