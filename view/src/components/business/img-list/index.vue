<script>
import { defineComponent, nextTick, onMounted, reactive, toRefs, watch } from 'vue'
import waterfall from './waterfall'
import bookcase from './bookcase'
import myImage from '@/components/common/image.vue'

export default defineComponent({
  name: 'ImgList',
  components: { MyImage: myImage },
  props: {
    data: {
      default: () => [],
    },
  },
  setup(props, context) {
    const state = reactive({
      listEl: null,
      list: [],
      listHeight: 0,
      type: 0, // 页面样式类别：元素等宽或者等高
      currentDate: '',
    })
    // state.dateStr = computed(() => )

    onMounted(async () => {
      await nextTick()
      await changeList(props.data)
      state.currentDate = state.list[0].dateStr
      document.body.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        const index = state.list.findIndex(x => x.top >= scrollTop)
        state.currentDate = state.list[index].dateStr
      })
    })
    watch(props.data, async (newList) => {
      changeList(newList)
    })
    window.onresize = function () {
      changeList(props.data)
    }

    async function changeList(data) {
      const typeExecute = { 0: waterfallFn, 1: bookcaseFn }
      data = data || props.data
      await typeExecute[state.type](data)
      observer()
    }

    // 瀑布流等宽式布局
    async function waterfallFn(data) {
      await waterfall(state, data)
    }

    // 书架流等高式布局
    async function bookcaseFn(data) {
      await bookcase(state, data)
    }

    const change = (e, imgData) => {
      context.emit('change', { e, imgData })
    }

    const changeType = () => {
      state.type = state.type === 0 ? 1 : 0
      changeList()
    }

    function observer() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((item) => {
          if (item.isIntersecting) {
            const index = +item.target.getAttribute('index')
            state.list[index].show = state.list[index].thumb
            observer.unobserve(item.target) // 停止监听该div DOM节点
          }
        })
      }) // 不传options参数，默认根元素为浏览器视口
      document.querySelectorAll('.img-box').forEach(div => observer.observe(div)) // 遍历监听所有div DOM节点
    }

    return {
      ...toRefs(state),
      change,
      changeType,
    }
  },
})
</script>

<template>
  <div ref="listEl" class="list" :style="{ height: type === 0 ? `${listHeight}px` : '' }">
    <div class="datetime">
      {{ currentDate }}
    </div>
    <div class="button" @click="changeType">
      切换样式
    </div>
    <div v-for="(img, i) in list" :key="`img${i}`" class="img-box" :style="{ position: type === 0 ? 'absolute' : '', width: `${img.w}px`, height: `${img.h}px`, margin: img.m, left: `${img.left}px`, top: `${img.top}px` }" :index="i">
      <MyImage :src="img.show" :data="img" @click="change($event, img)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list {
  position: relative;
  font-size: 0;
}
.img-box {
  border-radius: 4px;
  transition: all 0.6s;
  //   position: absolute;
  display: inline-block;
  cursor: pointer;
  //   background-size: cover;
  overflow: hidden;
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}
.button {
  position: fixed;
  right: 4px;
  top: 4px;
  z-index: 9999;
  color: #ffffff;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.6);
  padding: 7px 12px;
  border-radius: 15px;
}
.datetime {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  width: 100vw;
  height: 56px;
  color: #ffffff;
  padding: 8px 10px;
  font-size: 17px;
  letter-spacing: 1px;
}
</style>
