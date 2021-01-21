// axios.js文件

import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
// let baseURL = 'https://api.fiytech.com' // 测试
let baseURL = 'https://api.movtile.com' // 生产
let axiosPromiseArr = []


axios.defaults.adapter = function (config) { //自己定义个适配器，用来适配uniapp的语法
  console.log(config)
  uni.showToast({
    title: '标题2',
    duration: 2000
  });
  return new Promise((resolve, reject) => {
    console.log(config)
    var settle = require('axios/lib/core/settle');
    var buildURL = require('axios/lib/helpers/buildURL');
    uni.showToast({
      title: '标题3',
      duration: 2000
    });
    uni.request({
      method: config.method.toUpperCase(),
      url: config.baseURL + buildURL(config.url, config.params, config.paramsSerializer),
      header: config.headers,
      data: config.data,
      dataType: config.dataType,
      responseType: config.responseType,
      sslVerify: config.sslVerify,
      complete: function complete(response) {
        console.log("执行完成：", response, 111, config)
        uni.showToast({
          title: response + '4',
          duration: 2000
        });
        response = {
          data: response.data,
          status: response.statusCode,
          errMsg: response.errMsg,
          header: response.header,
          config: config
        };

        settle(resolve, reject, response);
      }
    })
  })
}
const httpRequest = axios.create({
  withCredentials: true,
  crossDomain: true,
  baseURL,
  timeout: 6000
})

httpRequest.setToken = token => {
  console.log(token)
  httpRequest.defaults.headers.Authorization = token
  store.commit('SET_TOKEN', token)
}
const getDataType = obj => {
  let rawType = Object.prototype.toString.apply(obj)
  let len = rawType.length - 1
  return rawType.substring(8, len)
}
// 是否正在刷新的标记
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests = []

const instanceConf = config => {
  config.cancelToken = new axios.CancelToken(cancel => {
    axiosPromiseArr.push({ cancel })
  })
  console.log(config)
  // token
  if (store.state.token) {
    config.headers['Authorization'] = store.state.token
  }
  if (
    config.method === 'post' &&
    config.data &&
    config.headers['Content-Type'] !== 'application/json' &&
    config.headers['Content-Type'] !== 'multipart/form-data'
  ) {
    //   if (getDataType(config.data) === 'Object') {
    //     config.data = qs.stringify(config.data)
    //   }
  }
  config.headers['ClientType'] = 'WEB'
  config.headers['X-AUTHORIZATION'] = store.state.token
  config.headers['R-AUTHORIZATION'] = store.state.refreshToken
  config.headers['X-APPID'] = '11'
  config.headers['X-CLIENT-TYPE'] = 'WEB'
  return config
}
/**
 * 重定向
 */
const routerRedirect = ({ path = '/login', redirect }) => {
  // Message.warning(`身份过期，请重新登录!`)
  if (router.currentRoute.path != '/login') {
    setTimeout(() => {
      store.commit('logout')
      router.replace({ path, query: { redirect } })
    }, 1200)
  }
}

// 请求拦截
httpRequest.interceptors.request.use(instanceConf, function (error) {
  uni.showToast({
    title: error + '6',
    duration: 2000
  });
  return Promise.reject(error)
})

// 响应拦截
httpRequest.interceptors.response.use(
  async function (response) {
    console.log(response)
    uni.showToast({
      title: '512' + JSON.stringify(response.errMsg),
      duration: 2000
    });
    // uni.showToast({
    //   title: JSON.stringify(response.data) + '781',
    //   duration: 2000
    // });
    let code = response && response.data && response.data.code || '无code'
    // uni.showToast({
    //   title: code + '7',
    //   duration: 2000
    // });
    let whiteList = [0, 200]
    if (whiteList.includes(code)) {
      return response.data
    } else if (code == 402) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const {
            data: { token }
          } = await refreshtokenApi()
          if (token) {
            httpRequest.setToken(token)
            response.config.headers.Authorization = token
            // 已经刷新了token，将所有队列中的请求进行重试
            requests.forEach(cb => cb(token))
            requests = []
            return httpRequest(instanceConf(response.config))
          }
        } catch (error) {
          //刷新时候直接判断token 不用判断code
          console.error('refreshtoken error =>', error)
          routerRedirect({ redirect: router.currentRoute.fullPath })
        } finally {
          isRefreshing = false
        }
      } else {
        // 正在刷新token，将返回一个未执行resolve的promise
        return new Promise(resolve => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requests.push(token => {
            response.config.headers.Authorization = token
            resolve(httpRequest(instanceConf(response.config)))
          })
        })
      }
    } else if (
      [
        401,
        10005,
        500000,
        500001,
        500002,
        500003,
        500004,
        600000,
        600001,
        150000,
        100001,
        20003
      ].includes(code)
    ) {
      routerRedirect({ redirect: router.currentRoute.fullPath })
    }
    // Message({ type: 'error', message: response.data.msg })
    return Promise.reject(response.data)
  },
  function (error) {
    console.log(error)
    if (error && error.response && error.response.status === 401) {
      routerRedirect({ redirect: router.currentRoute.fullPath })
    }
    // Message({ type: 'error', message: 'hhhhhhh' })
    if (error && error.message) {
      if (error.message === 'timeout of 10000ms exceeded') {
        return Promise.reject(error)
      }
      if (
        error.response &&
        error.response.status === 500 &&
        error.response.data.msg === '服务器内部错误' &&
        error.response.config.url ===
        '/vc-project-service/projectPermissionVc/addClipUserLastViewRecords'
      ) {
        return Promise.reject(error)
      }
      return new Promise(() => { })
    }
    console.log(error)
    return Promise.reject(error)
  }
)


// export default httpRequest

export { httpRequest, axiosPromiseArr }