import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NotFound from '@/pages/404.vue';
import Platform from '@/pages/platform.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: `/a`
  },
  {
    name: 'platform',
    path: '/:id',
    component: Platform,
    props: true,
    meta: { title: 'model' }
  },
  {
    name: '404',
    path: '/404',
    component: NotFound
  },
  {
    path: '/:catchAll(.*)', // 此处需特别注意至于最底部
    redirect: '/404'
  }
];
let history = createWebHistory();
const router = createRouter({
  history,
  routes,
});
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `IEEE ITSC 2022 | ${to.meta.title}`;
  }
  next();
});

export default router;
