const gap = 8 // 图片之间的间隔
let limitWidth = 0 // 宽度限制

export default async (state, data) => {
  limitWidth = state.listEl.parentNode.offsetWidth
  let neatArr = []

  const list = JSON.parse(JSON.stringify(data))
  neatArr = await createNewArr(list)

  state.list.length <= 0 && (state.list = neatArr)
  for (let i = 0; i < state.list.length; i++) {
    state.list[i].w = neatArr[i].w
    state.list[i].h = neatArr[i].h
    state.list[i].m = neatArr[i].m
    state.list[i].top = neatArr[i].top
  }
}

async function createNewArr(list) {
  const standardHeight = document.body.clientHeight / 2 // 180 // 高度阈值
  const neatArr = [] // 整理后的数组
  let count = 0
  function factory(cutArr) {
    return new Promise((resolve) => {
      const lineup = list.shift()
      if (!lineup) {
        resolve({ height: calculate(cutArr), list: cutArr })
        return
      }
      cutArr.push(lineup)
      const finalHeight = calculate(cutArr)
      if (finalHeight > standardHeight) {
        resolve(factory(cutArr))
      }
      else {
        count++
        resolve({ height: finalHeight, top: count * finalHeight + gap, list: cutArr })
      }
    })
  }
  function calculate(cutArr) {
    let cumulate = 0
    for (const iterator of cutArr) {
      const { width, height } = iterator
      cumulate += width / height
    }
    return (limitWidth - gap * (cutArr.length - 1)) / cumulate
  }
  async function handleList() {
    // if (list.length <= 0) {
    //   return
    // }
    const { list: newList, height, top } = await factory([list.shift()])
    neatArr.push(
      newList.map((x, index) => {
        x.w = (x.width / x.height) * height
        x.h = height
        x.m = index ? `0 0 ${gap}px ${gap}px` : `0 0 ${gap}px 0`
        x.top = top
        return x
      }),
    )
    if (list.length > 0)
      await handleList()
  }

  await handleList()

  return neatArr.flat()
}
