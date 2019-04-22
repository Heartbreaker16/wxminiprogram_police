<template>
<div class='container'>
<navigator v-for='(v,i) in list' :key='i' :url="'../caseDetail/main?MSID=' + v.MSID">
  <div v-if='v.title' class='title'>{{v.title}}</div>
  <div v-else class='title' style='color: #E64340'>紧急报警</div>
  <div class='text'>{{v.detail}}</div>
  <div class='foot'>
    <div class='time'>{{v.time}}</div>
    <div v-if='v.handled' class='handle'>已受理</div>
    <div v-else />
  </div>
</navigator>
<div v-if='list.length===0 && hasLoad' class='nodata'><img src='/static/images/empty.png'>暂无内容</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      list: [],
      hasLoad: false
    }
  },
  methods: {
    getList(){
      wx.showLoading({title:'正在加载'})
      wx.request({
        url: this.rootUrl + 'list',
        data: { id: wx.getStorageSync('userInfo').id },
        success: res => {
          this.list = res.data
          this.hasLoad = true
          wx.hideLoading()
        }
      })
    }
  },
  onLoad(){
    this.getList()
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
    padding 26rpx 40rpx
    background white
    border-bottom 1rpx solid #EEE
    .title
      font bold 32rpx/50rpx !specified
      padding-bottom 18rpx
    .text
      overflow hidden
      text-overflow ellipsis
      display -webkit-box
      -webkit-line-clamp 3
      -webkit-box-orient vertical
      font 28rpx/38rpx !specified
    .foot
      display flex
      justify-content space-between
      align-items center
      padding-top 22rpx
      font 29rpx/38rpx !specified
      color grey
      .handle
        font 28rpx/38rpx !specified
        padding 0 12rpx
        background #09bb07
        border-radius 6rpx
        color white
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