import Mock from 'mockjs';
import { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/post',
    method: 'post',
    timeout: 2000,
    response: {
      code: 0,
      data: {
        name: 'vben',
      },
    },
  },
  {
    url: '/api/get-menu-list-i18n',
    method: 'get',
    timeout: 2000,
    response: {
      code: 0,
      data: {
        ...Mock.mock({
          list: [
            {
              path: '/frame',
              name: 'Frame',
              component: 'Layout',
              redirect: '/frame/doc',
              meta: {
                icon: 'internet',
                title: {
                  zh_CN: '外部页面',
                  en_US: 'External',
                },
              },
              children: [
                {
                  path: 'doc',
                  name: 'Doc',
                  component: 'IFrame',
                  meta: {
                    frameSrc: 'https://tdesign.tencent.com/starter/docs/vue-next/get-started',
                    title: {
                      zh_CN: '使用文档（内嵌）',
                      en_US: 'Documentation(IFrame)',
                    },
                  },
                },
                {
                  path: 'TDesign',
                  name: 'TDesign',
                  component: 'IFrame',
                  meta: {
                    frameSrc: 'https://tdesign.tencent.com/vue-next/getting-started',
                    title: {
                      zh_CN: 'TDesign 文档（内嵌）',
                      en_US: 'TDesign (IFrame)',
                    },
                  },
                },
                {
                  path: 'TDesign2',
                  name: 'TDesign2',
                  component: 'IFrame',
                  meta: {
                    frameSrc: 'https://tdesign.tencent.com/vue-next/getting-started',
                    frameBlank: true,
                    title: {
                      zh_CN: 'TDesign 文档（外链',
                      en_US: 'TDesign Doc(Link)',
                    },
                  },
                },
              ],
            },
          ],
        }),
      },
    },
  },
] as MockMethod[];
