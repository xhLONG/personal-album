export default (url, cb) => {
  const image = new Image()
  image.src = url
  image.onload = function () {
    cb()
  }
}
