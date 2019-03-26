<template>
<div class='container'>
<navigator v-for='(v,i) in news' :key='i' :url="'../newsDetail/main?NSID=' + v.NSID">
<div>
  <div class='title'>{{v.title}}</div>
  <div class='time'>{{v.time}}</div>
</div>
<img :src='rootUrl + v.img'>
</navigator>
<div v-if='news.length===0 && hasLoad' class='nodata'><img src='/static/images/empty.png'>暂无内容</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      news: [],
      hasLoad: false
    }
  },
  methods: {
    getNews(){
      wx.showLoading({title: '正在加载'})
      wx.request({
        url: this.rootUrl + 'news',
        success: res => {
          this.news = res.data
          this.hasLoad = true
          wx.hideLoading()
        }
      })
    }
  },
  onLoad(){
    this.getNews()
  },
  onUnload(){
    this.hasLoad = false
  }
}
</script>

<style lang="stylus" scoped>
.container
  position absolute
  height 100%
  width 100%
  background #EEE
  navigator
    padding 35rpx 40rpx
    background white
    border-bottom 1rpx solid #EEE
    display flex
    justify-content space-between
    align-items center
    box-sizing border-box
    border-box 1rpx solid #EEE
    >div
      height 130rpx
      width calc(100% - 230rpx)
      .title
        height 100rpx
        font 35rpx/40rpx !specified
      .time
        height 30rpx
        font 26rpx/30rpx !specified
        color grey
    img 
      width 200rpx
      height 130rpx
      border-radius 10rpx
      margin-left 30rpx
  .nodata
    position fixed
    height 100%
    width 100%
    display flex
    justify-content center
    align-items center
    flex-direction column
    font 35rpx/35rpx !specified
    background white
    color #555
    img
      height 200rpx
      width 200rpx
      margin-bottom 20rpx
</style>