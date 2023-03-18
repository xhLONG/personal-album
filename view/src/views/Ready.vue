<script>
import { defineComponent, onMounted } from 'vue'
export default defineComponent({
  setup() {
    onMounted(() => {
      // const { proxy } = getCurrentInstance();
      // console.log(internalInstance.appContext.config.globalProperties);
    })
  },
})
</script>

<template>
  <router-view />
</template>

<style>
</style>
