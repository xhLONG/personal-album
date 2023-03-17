import { createRouter, createWebHashHistory } from 'vue-router'
import hook from './hook'

import base from './base'
import config from '@/config'

const routes = [...base]

const router = createRouter({
  history: createWebHashHistory(config.BASE_URL), // import.meta.env.BASE_URL
  routes,
})

hook(router)

export default router
