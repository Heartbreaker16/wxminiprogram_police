import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

Vue.mixin({
  data() {
    return {
      rootUrl: 'http://101.132.123.189/'
    }
  }
})

const app = new Vue(App)
app.$mount()

wx.setEnableDebug({
  enableDebug: true
})
