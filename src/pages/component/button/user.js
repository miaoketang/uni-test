// user.js文件 
// import Vue from 'vue';
import { httpRequest } from '@/lib/axios'
/*
// 获取登陆验证码
export const loginRegisterApi = (params) => {
    console.log("请求Vue:",Vue,params)
    return Vue.prototype.$axios.post(
        '/account-service/loginRegister',
        params
    )
}
// 初始化协剪产品数据
export const initFIoSystem = (params) => {
    console.log("请求Vue:",Vue,params)
    return Vue.prototype.$axios.get(
        '/auth-service/init/system/initFIoSystem',
        params
    )
}
// 获取用户所有拥有权限
export const getPermissionSysteminfo = (params) => {
    console.log("请求Vue:",Vue,params)
    return Vue.prototype.$axios.get(
        '/auth-service/permission/system/info',
        params
    )
}
*/

// 第十期优化
// 登录注册接口
export function loginRegisterApi(data) {

  return httpRequest({
    url: '/account-service/loginRegister',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}
// 初始化协剪产品数据
export function initFIoSystem(params) {
  return httpRequest({
    url: '/auth-service/init/system/initFIoSystem',
    method: 'get',
    params
  })
}
// 获取用户所有拥有权限
export function getPermissionSysteminfo(params) {
  return httpRequest({
    url: '/auth-service/permission/system/info',
    method: 'get',
    params
  })
}