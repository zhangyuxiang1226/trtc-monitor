import { DashboardIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/monitor',
    name: 'dashboard',
    meta: {
      title: '仪表盘',
      icon: DashboardIcon,
    },
    children: [
      // {
      //   path: 'base',
      //   name: 'DashboardBase',
      //   component: () => import('@/pages/dashboard/base/index.vue'),
      //   meta: { title: '概览仪表盘' },
      // },
      // {
      //   path: 'detail',
      //   name: 'DashboardDetail',
      //   component: () => import('@/pages/dashboard/detail/index.vue'),
      //   meta: { title: '统计报表' },
      // },
      {
        path: 'monitor',
        name: 'RtcMonitor',
        component: () => import('@/pages/dashboard/monitor/index.vue'),
        meta: { title: 'RTC 监控' },
      },
    ],
  },
];
