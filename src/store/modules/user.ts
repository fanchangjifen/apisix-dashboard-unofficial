import { defineStore } from 'pinia';

import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

const InitUserInfo: UserInfo = {
  name: '', // 用户名，用于展示在页面右上角头像处
  roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '', // 默认token不走权限
    apisixAdminEndpoint: '',
    apisixAdminKey: '',
    apisixControlEndpoint: '',
    apisixControlKey: '',
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(apisixAdminEndpoint: string, apisixAdminKey: string) {
      this.apisixAdminEndpoint = apisixAdminEndpoint;
      this.apisixAdminKey = apisixAdminKey;
      this.token = 'main_token';
    },
    async getUserInfo() {
      const mockRemoteUserInfo = async (token: string) => {
        if (token === 'main_token') {
          return {
            name: 'Tencent',
            roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
          };
        }
        return {
          name: 'td_dev',
          roles: ['UserIndex', 'DashboardBase', 'login'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
        };
      };
      const res = await mockRemoteUserInfo(this.token);

      this.userInfo = res;
    },
    async logout() {
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
  },
  persist: {
    afterRestore: (ctx) => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes(ctx.store.$state.userInfo.roles);
    },
    key: 'user',
    paths: ['token'],
  },
});
