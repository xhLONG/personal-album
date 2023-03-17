<template>
  <div class="img">
    <img v-show="!loading" :src="src" :raw="data.url" :date="data.datetime" @load="loadDone" />
    <div v-if="loading" class="color" :style="{ background: data.color }" />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'Image',
  props: {
    src: {},
    data: {},
  },
  setup(props) {
    const loading = ref(true)

    const loadDone = () => {
      loading.value = false
    }

    watch(() => props.src, () => {
        loading.value = true
    })

    return { loading, loadDone }
  },
})
</script>

<style scoped>
.img {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.img > img {
  display: block;
  width: 100%;
  height: 100%;
}

.color {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  animation: breathe 600ms ease-out infinite alternate;
}
@keyframes breathe {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}
</style>