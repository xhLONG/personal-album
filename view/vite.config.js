import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import postCssPxToRem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'

const resolve = (...data) => path.resolve(__dirname, ...data)
const prefix = process.env

// https://vitejs.dev/config/
export default defineConfig({
  base: prefix.NODE_ENV === 'development' ? '/' : './',
  plugins: [
    vue(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  css: {
    postcss: {
      plugins: [
        postCssPxToRem({
          // 自适应，px>rem转换
          rootValue: 100, // 1rem的大小
          minPixelValue: 1,
          propList: ['*'], // 需要转换的属性，这里选择全部都进行转换
          selectorBlackList: ['html'],
        }),
        autoprefixer({
          // 自动添加前缀
          overrideBrowserslist: [
            'Android 4.1',
            'iOS 7.1',
            'Chrome > 31',
            'ff > 31',
            'ie >= 8',
            'last 10 versions', // 所有主流浏览器最近10个版本
          ],
          grid: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  define: {
    'process.env': process.env,
  },
})
