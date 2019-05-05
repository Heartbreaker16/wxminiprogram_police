import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

Vue.mixin({
  data() {
    return {
      rootUrl: 'http://207.148.90.74/'
      // rootUrl: 'http://47.92.247.229/'
    }
  }
})

const app = new Vue(App)
app.$mount()

wx.setEnableDebug({
  enableDebug: true
})
