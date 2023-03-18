const fse = require('fs-extra')
const path = require('path')
const sizeOf = require('image-size')
const ExifImage = require('exif').ExifImage
const images = require('images')
const dayjs = require('dayjs')
const ColorThief = require('colorthief')

const config = require('./config/index')
const basePath = path.resolve('photos')
const generatePhotoDataPath = path.resolve(config.generatePhotoDataPath)
const picsData = []

fse.ensureFileSync(config.generatePhotoDataPath)
fse.ensureDirSync(config.generatePhotoDir)

fse.readdir(basePath, async function (err, files) {
  console.log('图片总数量：', files.length)
  //遍历读取到的文件列表
  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filedir = path.join(basePath, filename)
    //根据文件路径获取文件信息，返回一个fse.Stats对象
    const stats = await fse.statSync(filedir)
    if (stats.isFile()) {
      console.log(`正在处理(${i}/${files.length})：` + filename)
      try {
        // 生成压缩图
        images(filedir)
          .size(config.thumbSize)
          .save(path.resolve(`view/public/thumb-${filename}`), { quality: 75 })
      } catch (error) {
        console.log(error)
      }
      // 处理json数据
      let dimensions = { url: filename, datetime: dayjs(stats.birthtime).format('YYYY-MM-DD hh:mm:ss'), thumb: 'thumb-' + filename }
      try {
        dimensions = { ...dimensions, ...(await exifGetInfo(filename)) }
      } catch (error) {
        console.log(error)
      }
      try {
        dimensions = { ...dimensions, ...sizeOf(filedir) }
        if ([6, 8, 3].includes(dimensions.orientation) || dimensions.privacy) {
          // TODO：通过解码写入来复制图片，判断方向是否正确。
          console.log('图片解码中...')
          images(filedir).save(path.resolve(`${config.generatePhotoDir}/${filename}`))
        } else {
          cp(filedir, path.resolve(`${config.generatePhotoDir}/${filename}`))
        }
      } catch (error) {
        console.log(error)
      }
      if (dimensions.width) {
        const color = await getColor(filename)
        picsData.push({ ...dimensions, ...getDate(dimensions.datetime), color: rgbToHex(color), size: calculateSize(stats.size / 1024) })
      }
    }
  }

  // 解析完毕，生成json
  fse.writeFileSync(generatePhotoDataPath, JSON.stringify(picsData))
  console.log('🎉 All done, have fun! 😁')
})

// 获取图片元数据
function exifGetInfo(filename) {
  return new Promise((resolve, reject) => {
    const filedir = path.join(basePath, filename)
    new ExifImage({ image: filedir }, async function (error, exifData) {
      if (!error) {
        const { ImageWidth: width, ImageHeight: height, ModifyDate } = exifData.image
        const result = {}
        let datetime = exifData.exif.DateTimeOriginal || ModifyDate
        width && (result.width = width)
        height && (result.height = height)
        datetime && (result.datetime = datetime.split(' ')[0].replace(/:/g, '-') + ' ' + datetime.split(' ')[1].slice(0, 8))
        if (exifData.image && exifData.exif) {
          result.exif = await getExif({ ...exifData.image, ...exifData.exif })
        }
        if (config.isPrivacy && JSON.stringify(exifData.gps) === '{}') {
          result.privacy = true
        }
        resolve(result)
      } else reject()
    })
  })
}

// 获取日期详情
function getDate(datetime) {
  const day = dayjs(datetime)
  return { stamp: day.unix(), year: day.format('YYYY'), month: day.format('YYYY-MM'), date: day.format('YYYY-MM-DD'), dateStr: day.format('YYYY年MM月DD日') }
}

// 获取图片主颜色
function getColor(filename) {
  return new Promise((resolve) => {
    ColorThief.getColor(path.resolve(`${config.generatePhotoDir}/thumb-${filename}`), 10)
      .then((color) => {
        resolve(color)
      })
      .catch((err) => {
        console.log(err)
      })
  })
}

// 转换三元色为16进制颜色
const rgbToHex = (rgb) =>
  '#' +
  rgb
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')

// 复制文件
function cp(from, to) {
  fse.writeFileSync(to, fse.readFileSync(from))
}

// exif信息整理
function getExif(ExifImage) {
  return new Promise((resolve) => {
    const { Model, FNumber, ExposureTime, ISO, FocalLength } = ExifImage
    const result = []
    Model && result.push({ name: '器材', value: Model })
    !isNaN(+FocalLength) && result.push({ name: '焦距', value: +FocalLength + 'mm' })
    const f = FNumber ? `F${FNumber}, ` : ''
    const et = ExposureTime ? `1/${(1 / +ExposureTime).toFixed(0)}s, ` : ''
    const iso = ISO ? `ISO${ISO}` : ''
    if (f || et || iso) {
      result.push({ name: '参数', value: f + et + iso })
    }
    resolve(result)
  })
}

// 计算大小
function calculateSize(num) {
  return num > 1024 ? (num / 1024).toFixed(2) + 'MB' : num.toFixed(1) + 'KB'
}
