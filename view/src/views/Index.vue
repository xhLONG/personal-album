<script>
import { defineComponent, reactive, toRefs } from 'vue'
import imgList from '@/components/business/img-list'
import preview from '@/components/business/preview'
import json from '@/assets/data/datalist.json'
// import player from '@/components/business/player'

export default defineComponent({
  components: { Preview: preview, ImgList: imgList },
  setup() {
    const state = reactive({
      preview: null,
      json: json.sort((a, b) => {
        return b.stamp - a.stamp
      }),
    })

    // setTimeout(() => {
    // console.log(groupBy(state.json, 'year'))
    // console.log(groupBy(state.json, 'month'))
    // console.log(groupBy(state.json, 'date'))
    // }, 1000)

    function groupBy(arr, key) {
      const result = {}
      for (const item of arr) {
        result[item[key]] = result[item[key]] || []
        result[item[key]].push(item)
      }
      return result
    }

    const checkImage = (e) => {
      state.preview.open(e)
    }

    return {
      ...toRefs(state),
      checkImage,
    }
  },
})
</script>

<template>
  <div class="home">
    <ImgList :data="json" @change="checkImage" />
    <Preview ref="preview" />
    <!-- <player /> -->
  </div>
</template>

<style lang="scss" scoped>
.home {
  margin: 8px;
  padding-bottom: 66px;
  // width: 100vw;
  // height: 100vh;
}
</style>
