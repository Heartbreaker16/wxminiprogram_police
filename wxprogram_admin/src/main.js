import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

Vue.mixin({
  data() {
    return {
      rootUrl: 'http://47.92.247.229:3000/'
    }
  }
})

const app = new Vue(App)
app.$mount()
wx.hideTabBar()
wx.setEnableDebug({
  enableDebug: true
})