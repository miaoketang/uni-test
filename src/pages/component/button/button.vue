<template>
  <view>
    <page-head :title="title"></page-head>
    <uni-popup ref="popup" type="bottom"
      >底部弹出 Popup----{{ test }}</uni-popup
    >
    <view class="uni-padding-wrap uni-common-mt">
      <button type="primary">页面主操作 Normal</button
      >{{ permission }}222222222222
      <button type="primary" :loading="loading">页面主操作 Loading</button>
      <button type="primary" disabled="true">页面主操作 Disabled</button>

      <button type="default">页面次要操作 Normal</button>
      <button type="default" disabled="true">页面次要操作 Disabled</button>

      <button type="warn">警告类操作 Normal</button>
      <button type="warn" disabled="true">警告类操作 Disabled</button>

      <view class="button-sp-area">
        <button type="primary" plain="true">按钮</button>
        <button type="primary" disabled="true" plain="true">
          不可点击的按钮
        </button>

        <button type="default" plain="true">按钮</button>
        <button type="default" disabled="true" plain="true">按钮</button>

        <button class="mini-btn" type="primary" size="mini">按钮</button>
        <button class="mini-btn" type="default" size="mini">按钮</button>
        <button class="mini-btn" type="warn" size="mini">按钮</button>
      </view>
      <!-- #ifdef MP-WEIXIN || MP-QQ -->
      <button
        open-type="launchApp"
        app-parameter="uni-app"
        @error="openTypeError"
      >
        打开APP
      </button>
      <button open-type="feedback">意见反馈</button>
      <!-- #endif -->
    </view>
  </view>
</template>
<script>
import {
  initFIoSystem,
  getPermissionSysteminfo,
  loginRegisterApi,
} from './user.js'
export default {
  data() {
    return {
      test: 1,
      permission: '',
      title: 'button',
      loading: false,
    }
  },
  onLoad() {
    this._timer = null
    this.loginFun()
  },
  onShow() {
    this.clearTimer()
    this._timer = setTimeout(() => {
      this.loading = true
    }, 300)
  },
  onUnload() {
    this.clearTimer()
    this.loading = false
  },
  methods: {
    loginFun() {
      this.test = 2

      uni.showToast({
        title: '标题2',
        duration: 2000,
      })
      loginRegisterApi({
        username: '18738973573',
        password: '12345678',
        appId: '11',
        appClientType: 'WEB',
      })
        .then((res) => {
          console.log('获取登陆验证码成功啦：', res)
          this.test = 3
          const { token, refreshToken } = res.data
          this.$store.commit('SET_TOKEN', token)
          this.$store.commit('SET_REFRESHTOKEN', refreshToken)

          this.initFIoSystem()
        })
        .catch((err) => {
          console.log('获取验证码失败啦：', err)
        })
    },
    initFIoSystem() {
      this.test = 4
      initFIoSystem()
        .then((res) => {
          console.log(res)
          this.getPermissionSysteminfo()
        })
        .catch((err) => {
          this.submitDisabled = false
          this.$message({
            type: 'error',
            message: err.msg,
            center: true,
          })
        })
    },
    getPermissionSysteminfo() {
      getPermissionSysteminfo()
        .then((res) => {
          //   uni.showToast({
          //     title: res + '999',
          //     duration: 2000,
          //   })
          this.permission = res.data.roles
        })
        .catch((err) => {
          this.submitDisabled = false
          this.$message({
            type: 'error',
            message: err.msg,
            center: true,
          })
        })
    },
    openTypeError(error) {
      console.error('open-type error:', error)
    },
    clearTimer() {
      if (this._timer != null) {
        clearTimeout(this._timer)
      }
    },
  },
}
</script>

<style>
button {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.button-sp-area {
  margin: 0 auto;
  width: 60%;
}

.mini-btn {
  margin-right: 10rpx;
}
</style>
