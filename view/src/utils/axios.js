import axios from 'axios'

// export default axios;
const fetch = (url, params, type) => {
  if (type === 'get') {
    return axios.get(url, {
      headers: {},
      params,
    })
  } else {
    return axios[type](url, params, {
      headers: {},
    })
  }
}

export default fetch
