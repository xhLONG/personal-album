<template>
  <div class="home">
    <img-list @change="checkImage" :data="json" />
    <preview ref="preview" />
    <!-- <player /> -->
  </div>
</template>

<script>
import imgList from '@/components/business/img-list'
import { defineComponent, toRefs, reactive } from 'vue'
import preview from '@/components/business/preview'
import json from '@/assets/data/datalist.json'
// import player from '@/components/business/player'

export default defineComponent({
  components: { preview, imgList,  },
  setup() {
    const state = reactive({
      preview: null,
      json: json.sort(function (a, b) {
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

<style lang="scss" scoped>
.home {
  margin: 8px;
  padding-bottom: 66px;
  // width: 100vw;
  // height: 100vh;
}
</style>

