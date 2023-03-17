<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    const str = 'destroyEvent'
    console.log(str)
    console.log('jj')
  },
})
</script>

<style>
img {
  /* Fix ios 图片问题，由postcss插件导致  */
  content: normal !important;
}
</style>
