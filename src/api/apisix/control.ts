import axios, { InternalAxiosRequestConfig } from 'axios';

import { useUserStore } from '@/store';

import * as control from './control/typescript-axios';

const axiosInstance = axios.create();

const userStore = useUserStore();

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.baseURL = userStore.apisixAdminEndpoint;
  config.headers.set('X-API-Key', userStore.apisixAdminKey);
  return config;
});

export const RouteApi = control.RouteApiFactory(undefined, '', axiosInstance);

export const PluginApi = control.PluginApiFactory(undefined, '', axiosInstance);

export const SchemaApi = control.SchemaApiFactory(undefined, '', axiosInstance);

export const ServiceApi = control.ServiceApiFactory(undefined, '', axiosInstance);

export const UpstreamApi = control.UpstreamApiFactory(undefined, '', axiosInstance);

export const HealthCheckApi = control.HealthCheckApiFactory(undefined, '', axiosInstance);

export const PluginMetadataApi = control.PluginMetadataApiFactory(undefined, '', axiosInstance);

export const ServiceDiscoveryApi = control.ServiceDiscoveryApiFactory(undefined, '', axiosInstance);

export const GarbageCollectionApi = control.GarbageCollectionApiFactory(undefined, '', axiosInstance);
