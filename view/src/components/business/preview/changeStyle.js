export default function (el, arr) {
  const original = el.style.cssText.split(';')
  original.pop()
  el.style.cssText = `${original.concat(arr).join(';')};`
}
