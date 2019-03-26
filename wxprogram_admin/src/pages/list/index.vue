<template>
<div class='container'>
<navigator v-for='(v,i) in list' :key='i' :url="'../detail/main?MSID=' + v.MSID">
  <div class='title'>{{v.title}}</div>
  <div class='text'>{{v.detail}}</div>
  <div class='foot'>
    <div class='name'>{{v.name}}</div>
    <div class='time'>{{v.time}}</div>
  </div>
</navigator>
<div v-if='list.length===0 && hasLoad' class='nodata'><img src='/static/images/empty.png'>暂无内容</div>
</div>
</template>

<script>
let PullDownRefresh = false
export default {
  data () {
    return {
      list: [],
      // PullDownRefresh: false,
      hasLoad: false
    }
  },
  methods: {
    getList(){
      this.hasLoad = false
      if(!PullDownRefresh)
        wx.showLoading({title:'正在加载'})
      wx.request({
        url: this.rootUrl + 'listAll',
        success: res => {
          this.list = res.data
          wx.hideLoading()
          this.hasLoad = true
          if(PullDownRefresh){
            setTimeout(()=>{
              wx.stopPullDownRefresh()
              wx.showToast({title:'数据已更新'})
              PullDownRefresh = false
            },2000)
          }
        }
      })
    }
  },
  onLoad(){
    this.getList()
  },
  onPullDownRefresh(){
    if(!PullDownRefresh){
      PullDownRefresh = true
      this.getList()
    }
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
      padding-bottom 10rpx
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
      font 26rpx/38rpx !specified
      color grey
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

