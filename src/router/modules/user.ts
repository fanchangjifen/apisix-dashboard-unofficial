import { LogoutIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

export default [
  {
    path: '/loginRedirect',
    name: 'loginRedirect',
    redirect: '/login',
    meta: { title: { zh_CN: '登录页', en_US: 'Login' }, icon: shallowRef(LogoutIcon), hidden: true },
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'index',
        redirect: '/login',
        component: () => import('@/layouts/blank.vue'),
        meta: { title: { zh_CN: '登录页', en_US: 'Login' } },
      },
    ],
  },
];
