import { MUSIC_URL, playListId } from '../../../../../config'
import fetch from '@/utils/axios'

export const getUrl = (params = {}) => fetch(`${MUSIC_URL}/song/url`, params, 'get')

// export const getDetail = (params: Type.Object) => fetch('http://localhost:9997/song/detail?ids=31134829,28762985', params, 'get')

export const getList = (params = {}) => fetch(`${MUSIC_URL}/playlist/detail?id=${playListId}`, params, 'get')
