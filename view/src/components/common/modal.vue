<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      default: false,
    },
  },
  setup(props, context) {
    const state = reactive({
      show: false,
    })

    watch(
      () => props.modelValue,
      (val) => {
        val !== state.show && (state.show = val)
        document.querySelector('body').style.overflow = val ? 'hidden' : ''
        // document.documentElement.style.touchAction = 'none'
      },
    )

    // onMounted(async () => {
    //   await nextTick();
    // });

    const close = () => {
      context.emit('update:modelValue', false)
      document.querySelector('body').style.overflow = ''
    }

    return {
      ...toRefs(state),
      close,
    }
  },
})
</script>

<template>
  <div v-show="show" class="modal" @click="close">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.modal {
  touch-action: none;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
