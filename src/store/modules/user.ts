import { defineStore } from 'pinia';

import { PluginApi } from '@/api/apisix/admin';
import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

const InitUserInfo: UserInfo = {
  name: '', // 用户名，用于展示在页面右上角头像处
  roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
};

export const useUserStore = defineStore('user', {
  state: () => ({
    keepLogin: false,
    token: '', // 默认token不走权限
    apisixAdminEndpoint: '',
    apisixControlEndpoint: '',
    apisixAdminKey: '',
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(
      apisixAdminEndpoint: string,
      apisixControlEndpoint: string,
      apisixAdminKey: string,
      keepLogin?: boolean,
    ) {
      this.apisixAdminEndpoint = apisixAdminEndpoint;
      this.apisixControlEndpoint = apisixControlEndpoint;
      this.apisixAdminKey = apisixAdminKey;

      await PluginApi.apisixAdminPluginsListGet();

      this.keepLogin = keepLogin;

      this.token = 'main_token';
    },
    async getUserInfo() {
      await PluginApi.apisixAdminPluginsListGet();
      this.userInfo = {
        name: 'admin',
        roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
      };
    },
    async logout() {
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
  },
  persist: {
    afterRestore: (ctx) => {
      if (!ctx.store.$state.keepLogin) {
        ctx.store.$reset();
      }

      const permissionStore = usePermissionStore();
      permissionStore.initRoutes(ctx.store.$state.userInfo.roles);
    },
    key: 'user',
    paths: ['keepLogin', 'token', 'apisixAdminEndpoint', 'apisixControlEndpoint', 'apisixAdminKey'],
  },
});
