const prefix = process.env

console.log(prefix.NODE_ENV) // development

const isDev = prefix.NODE_ENV === 'development'

export default {
  BASE_URL: isDev ? '/' : './',
  VERSION: '0.0.0',
  APP_COPYRIGHT: '',
  API_URL: 'http://localhost:9999',
  IMG_URL: '',
}
