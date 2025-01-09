import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/result',
    name: 'result',
    component: Layout,
    redirect: '/result/404',
    meta: {
      title: {
        zh_CN: '结果页',
        en_US: 'Result',
      },
      icon: 'check-circle',
      hidden: true,
    },
    children: [
      {
        path: '404',
        name: 'Result404',
        component: () => import('@/pages/result/404/index.vue'),
        meta: { title: { zh_CN: '访问页面不存在页', en_US: 'Not Found' } },
      },
      {
        path: '500',
        name: 'Result500',
        component: () => import('@/pages/result/500/index.vue'),
        meta: { title: { zh_CN: '服务器出错页', en_US: 'Server Error' } },
      },
    ],
  },
];
