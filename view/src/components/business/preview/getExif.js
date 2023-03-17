const win = window
export default (file) => {
  return new Promise((resolve) => {
    win.EXIF.getData(file, function () {
      console.log(win.EXIF.getAllTags(this))
      const { Model, FNumber, ExposureTime, ISOSpeedRatings, FocalLength } = win.EXIF.getAllTags(this)
      const result = []
      Model && result.push({ name: '器材', value: Model })
      !isNaN(+FocalLength) && result.push({ name: '焦距', value: `${+FocalLength}mm` })
      const f = FNumber ? `f/${FNumber}, ` : ''
      const et = ExposureTime ? `${(+ExposureTime).toFixed(2)}s, ` : ''
      const iso = ISOSpeedRatings ? `iso${ISOSpeedRatings}` : ''
      if (f || et || iso)
        result.push({ name: '参数', value: f + et + iso })

      resolve(result)
    })
  })
}
