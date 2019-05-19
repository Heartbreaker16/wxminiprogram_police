<template>
<div class='container'>
<div class='title'>{{detailObj.title}}</div>
<div class='time'>{{detailObj.time}}</div>
<img v-if='detailObj.img' v-show='imgHide' :src='rootUrl + detailObj.img' mode='widthFix' @load='imgHide=true'>
<rich-text class='detail' :nodes='detailObj.detail' space='emsp'/>
<div style='height: 60rpx; width: 100%;' />
</div>
</template>

<script>
export default {
  data () {
    return {
      detailObj: {},
      imgHide: false
    }
  },
  methods: {
    getDetail(){
      wx.showLoading({title:'正在加载'})
      wx.request({
        url: this.rootUrl + 'newsDetail',
        data: { NSID: this.$root.$mp.query.NSID },
        success: res => {
          this.detailObj = res.data[0]
          wx.hideLoading()
        }
      })
    }
  },
  onLoad(){
    this.getDetail()
  },
  onUnload(){
    this.detailObj = {}
    this.imgHide = false
  }
}
</script>

<style lang="stylus" scoped>
.container
  height 100%
  width 90%
  padding 0 5%
  .title
    font bold 42rpx/70rpx !specified
    margin 30rpx 0
  .time
    font 30rpx/30rpx !specified
    color grey
  img
    width 100%
    margin 30rpx 0
  .detail
    font 33rpx/52rpx !specified
    text-align justify
</style>

