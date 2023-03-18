<script>
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    const str = 'destroyEvent'
    console.log(str)
  },
})
</script>

<template>
  <router-view />
</template>

<style>
img {
  /* Fix ios 图片问题，由postcss插件导致  */
  content: normal !important;
}
</style>
