<script>
import { defineComponent, nextTick, onMounted, reactive, toRefs, watch } from 'vue'
// import getExif from './getExif'
import simulate from './simulate'
import modal from '@/components/common/modal.vue'
// import changeStyle from './changeStyle'
import loading from '@/components/common/loading.vue'

export default defineComponent({
  name: 'Preview',
  components: { Modal: modal, Loading: loading },
  props: {},
  setup(props, context) {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
    const state = reactive({
      show: false,
      wrap: null,
      img: null,
      scale: 1,
      style: {},
      left: 0,
      top: 0,
      offset: { left: 0, top: 0 },
      origin: 'center',
      delay: `${isMobile ? 0 : 0.3}s`,
      details: [], // 照片信息
      isLoading: false,
      size: 0,
    })

    let initialData = { offset: {}, origin: 'center', scale: 1 }
    let originInitial = {}
    let startPoint = { x: 0, y: 0 }
    let isTouching = false
    let isMoving = null // 正在移动中，与点击做区别
    const touches = new Map() // 触摸点数组
    let lastDistance = 0
    let lastScale = 1 // 记录下最后的缩放值
    let scaleOrigin = {
      x: 0,
      y: 0,
    }

    const { innerWidth: winWidth, innerHeight: winHeight } = window

    onMounted(async () => {
      await nextTick()
      window.addEventListener('pointerdown', (e) => {
        e.preventDefault()
        touches.set(e.pointerId, e) // 点击：存入触摸点
        isTouching = true
        startPoint = { x: e.clientX, y: e.clientY }
        if (touches.size === 2) {
          // 双指触摸时立即记录距离
          lastDistance = getDistance()
          lastScale = state.scale
        }
      })
      window.addEventListener('pointerup', (e) => {
        touches.delete(e.pointerId) // 抬起：移除触摸点
        if (touches.size <= 0) {
          isTouching = false
        }
        else {
          const touchArr = Array.from(touches)
          // 更新点位
          startPoint = { x: touchArr[0][1].clientX, y: touchArr[0][1].clientY }
        }
        setTimeout(() => {
          isMoving = false
        }, 300)
        if (!isMobile)
          state.delay = '0.3s' // 让PC滚轮缩放更平滑，移动端则不加动画，会掉帧
      })
      window.addEventListener('pointermove', (e) => {
        if (isTouching) {
          isMoving = startPoint.x - e.clientX
          if (touches.size < 2) {
            // 单指滑动
            state.delay = '0s'
            state.offset = {
              left: state.offset.left + (e.clientX - startPoint.x),
              top: state.offset.top + (e.clientY - startPoint.y),
            }
            // 更新点位
            startPoint = { x: e.clientX, y: e.clientY }
          }
          else {
            // 双指缩放
            touches.set(e.pointerId, e)
            const ratio = getDistance() / lastDistance
            state.scale = ratio * lastScale
            setCenter()
          }
        }
      })
      window.addEventListener('pointercancel', (e) => {
        touches.clear() // 可能存在特定事件导致中断，真机操作时 pointerup 在某些边界情况下不会生效，所以需要清空
      })
    })

    function setCenter(x = 0, y = 0) {
      const touchArr = Array.from(touches)
      if (touchArr.length === 2) {
        const start = touchArr[0][1]
        const end = touchArr[1][1]
        x = (start.offsetX + end.offsetX) / 2
        y = (start.offsetY + end.offsetY) / 2
      }
      state.origin = `${x}px ${y}px`
      const offsetLeft = state.offset.left + (state.scale - 1) * (x - scaleOrigin.x)
      const offsetTop = state.offset.top + (state.scale - 1) * (y - scaleOrigin.y)
      scaleOrigin = { x, y }
      // 修正视野变化带来的平移量
      state.offset = { left: offsetLeft, top: offsetTop }
    }

    const zoom = (event) => {
      state.origin = `${event.offsetX}px ${event.offsetY}px`

      if (!event.deltaY)
        return

      event.preventDefault()
      // 缩放执行
      if (event.deltaY < 0) {
        state.scale += 0.1
        console.log('放大...')
      }
      else if (event.deltaY > 0) {
        state.scale >= 0.2 && (state.scale -= 0.1)
        console.log('缩小...')
      }
      setCenter(event.offsetX, event.offsetY)
    }

    let cloneEl = null
    let originalEl = null

    const open = async ({ e, imgData }) => {
      // state.isLoading = true
      reset()
      originalEl = e.target
      cloneEl = originalEl.cloneNode(true)
      // cloneEl = new Image()
      // 获取Exif信息(Exif改在node步骤保存)
      const imageExifDetail = imgData.exif || []
      state.details = imageExifDetail.concat([{ name: '摄于', value: originalEl.getAttribute('date') }])
      state.size = imgData.size

      originalEl.style.opacity = 0
      cloneEl.style.width = '100%'
      const { top, left } = originalEl.getBoundingClientRect()
      const { offsetWidth, offsetHeight, naturalWidth, naturalHeight } = originalEl
      originInitial = { top, left, width: offsetWidth } // 记录返回动画所需数据

      const originalCenterPoint = { x: offsetWidth / 2 + left, y: offsetHeight / 2 + top }
      const winCenterPoint = { x: winWidth / 2, y: winHeight / 2 }
      const offsetDistance = { left: winCenterPoint.x - originalCenterPoint.x + left, top: winCenterPoint.y - originalCenterPoint.y + top }
      const diffs = { left: ((adaptScale() - 1) * offsetWidth) / 2, top: ((adaptScale() - 1) * offsetHeight) / 2 }

      state.wrap.appendChild(cloneEl)
      // state.offset = { top: top, left: left }
      state.style = { top: `${top}px`, left: `${left}px`, width: `${offsetWidth}px` }
      state.show = true
      state.delay = '.3s'
      await nextTick()
      setTimeout(async () => {
        // 注册缩放事件
        registerEvent()
        await nextTick()
        // state.offset = offsetDistance
        setTimeout(
          () => {
            const ratio = adaptScale()
            // state.wrap.firstChild.style.width = offsetWidth * ratio + 'px'
            // state.offset = { left: offsetDistance.left - ((ratio - 1) * offsetWidth) / 2, top: offsetDistance.top - ((ratio - 1) * offsetHeight) / 2 }
            state.offset = { left: offsetDistance.left - left - diffs.left, top: offsetDistance.top - top - diffs.top }
            state.style = { top: `${top}px`, left: `${left}px`, width: `${offsetWidth * ratio}px` }
            // 消除偏差
            setTimeout(() => {
              state.delay = '0s'
              state.offset = { left: offsetDistance.left - diffs.left, top: offsetDistance.top - diffs.top }
              state.style = { top: '0px', left: '0px', width: `${offsetWidth * ratio}px` }
              // 动画结束
              init()
            }, 300)
          },
          isMobile ? 10 : 200,
        )
        // scaleOrigin = {x: winWidth / 2, y: winHeight / 2}
      }, 10)
    }

    function showRaw() {
      state.isLoading = true
      // 动画结束，加载原图
      simulate(originalEl.getAttribute('raw'), async () => {
        await nextTick()
        cloneEl.src = originalEl.getAttribute('raw')
        state.isLoading = false
        state.size = 0
      })
    }

    function adaptScale() {
      // 返回自适应屏幕的缩放值
      const { offsetWidth: w, offsetHeight: h } = originalEl
      let scale = 0
      scale = winWidth / w
      if (h * scale > winHeight - 80)
        scale = (winHeight - 80) / h

      return scale
    }

    function reset() {
      // 重置数据
      state.scale = 1
      state.offset = { left: 0, top: 0 }
      state.origin = 'center'
      state.details = []
    }

    function init() {
      // 处理初始化数据
      initialData = { offset: state.offset, origin: state.origin, scale: state.scale }
    }

    watch(
      () => state.show,
      (show) => {
        if (show === false) {
          originalEl.style.opacity = 1
          cloneEl && cloneEl.remove()
          destroyEvent()
        }
      },
    )

    let timer = null
    let touchStamp = 0
    const tap = () => {
      timer && clearTimeout(timer)
      if (!touchStamp) {
        touchStamp = new Date().getTime()
      }
      else {
        // 触发双击
        dbClick()
        touchStamp = 0
        return
      }
      timer = setTimeout(() => {
        if (touches.size < 2) {
          touchStamp = 0
          // isMoving ? () : (state.show = false)
          if (isMoving) {
            isMoving = false
          }
          else {
            const { top, left, width } = originInitial
            state.delay = '.3s'
            state.offset = { left, top }
            state.style = { width: `${width}px` }
            setTimeout(() => {
              state.show = false
            }, 300)
          }
        }
      }, 280)
    }

    function dbClick() {
      const isChange = state.scale !== initialData.scale
      if (isChange) {
        // 还原初始状态
        for (const key in initialData) {
          if (Object.prototype.hasOwnProperty.call(initialData, key))
            state[key] = initialData[key]
        }
      }
      else {
        state.scale = state.scale + 2
      }
    }

    // 注册事件
    function registerEvent() {
      state.wrap.addEventListener('mousewheel', zoom, { passive: false })
    }

    // 销毁事件
    function destroyEvent() {
      // 注销缩放监听
      state.wrap.removeEventListener('mousewheel', zoom)
    }

    // 获取距离
    function getDistance() {
      const touchArr = Array.from(touches)
      if (touchArr.length < 2)
        return 0

      const start = touchArr[0][1]
      const end = touchArr[1][1]
      return Math.hypot(end.x - start.x, end.y - start.y)
    }

    return {
      ...toRefs(state),
      open,
      tap,
      showRaw,
    }
  },
})
</script>

<template>
  <Modal v-model="show" :style="{ '--delay_time': delay }">
    <div ref="wrap" :style="{ ...style, transformOrigin: origin, transform: `translate(${offset.left}px, ${offset.top}px) scale(${scale},${scale})` }" class="wrap" @click.stop="tap" />
    <div class="info">
      <div v-for="(d, di) in details" :key="`d${di}`">
        {{ d.name }}: {{ d.value }}
      </div>
    </div>
    <Loading v-show="isLoading" />
    <div v-show="size" class="download">
      <span class="btn" @click.stop="showRaw">查看原图 ({{ size }})</span>
    </div>
  </Modal>
  <!-- <div style="position: fixed; z-index: 9999999; color: #fff; top: 0; left: 0">{{ test }}</div> -->
</template>

<style lang="scss" scoped>
.wrap {
  user-select: none;
  position: absolute;
  transition: all var(--delay_time);
  transform: translateZ(0);
  img {
    width: 100%;
    height: 100%;
  }
}
// .img {
// will-change: transform;
// }
.info {
  padding: 0 0.5rem;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  color: #ffffff;
  padding-bottom: calc(6px + constant(safe-area-inset-bottom));
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
  div {
    font-size: 12px;
    padding: 8px 0;
  }
}
.download {
  position: fixed;
  top: 14px;
  width: 100%;
  text-align: center;
  .btn {
    color: #ffffff;
    font-size: 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 4px 6px;
    border-radius: 4px;
  }
}
</style>
