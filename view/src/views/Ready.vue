<template>
  <router-view />
</template>

<script>
import { onMounted, getCurrentInstance, defineComponent } from "vue";
export default defineComponent({
  setup() {
    onMounted(() => {
      // const { proxy } = getCurrentInstance();
      // console.log(internalInstance.appContext.config.globalProperties);
    });
  },
});
</script>

<style>
</style>
