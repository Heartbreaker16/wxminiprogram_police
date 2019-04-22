<template>
<div class='container'>
<div v-if='detailObj.title' class='title'>{{detailObj.title}}</div>
<div v-else class='title' style='color: #E64340'>紧急报警</div>

<div v-if='detailObj.voiceFile' class='para-title'><div/>录音文件</div>
<!-- <div v-if='detailObj.voiceFile' class='voice' @tap='playOrStop'>
  <div v-if='playing' class='stop'/>
  <div v-else class='play'/>
  <div v-if='playing' class='progress' :style="['width:'+progress+'%;']" />
  <div v-else class='text'>点击播放录音</div>
</div> -->
<audio v-if='detailObj.voiceFile' :src='rootUrl + detailObj.voiceFile' name='录音文件' author=' ' controls></audio>
<div class='para-title'><div/>警情概要</div>
<!-- <div class='sub-info'><div>姓名：</div><div>{{detailObj.name}}</div></div>
<div class='sub-info'><div>手机号：</div><div>{{detailObj.phone}}</div></div>
<div class='sub-info'><div>身份证号：</div><div>{{detailObj.idcard}}</div></div> -->
<div class='sub-info'><div>事发地点：</div><div>{{detailObj.location}}</div></div>
<div class='sub-info'><div>案件类型：</div><div>{{detailObj.type}}</div></div>
<div class='sub-info'><div>报警时间：</div><div>{{detailObj.time}}</div></div>
<div class='sub-info'><div>受理状态：</div><div>{{detailObj.handled ? '已受理' : '未受理'}}</div></div>
<div class='para-title'><div/>案件详情</div>
<div class='detail'>{{detailObj.detail}}</div>
<div v-if='detailObj.imgFile' class='para-title'><div/>警情图片</div>
<img v-for='(v,i) in detailObj.imgFile' :key='i' :src='rootUrl + v' mode='widthFix'>
<div style='height: 60rpx; width: 100%;' />
</div>
</template>

<script>
// const innerAudioContext = wx.createInnerAudioContext()
// let currentTime = 0
// let duration = 0
// let interval = {}
export default {
  data () {
    return {
      detailObj: {},
      // name: '',
      // title: '',
      // location: '',
      // time: '',
      // detail: '',
      // voiceFile: '',
      // imgFile: [],
      // playing: false,
      // progress: 0,
    }
  },
  methods: {
    getDetail(){
      wx.showLoading({title:'正在加载'})
      wx.request({
        url: this.rootUrl + 'caseDetail',
        data: { MSID: this.$root.$mp.query.MSID },
        success: res => {
          this.detailObj = res.data
          // duration = res.data.duration
          // innerAudioContext.src = this.rootUrl + res.data.voiceFile
          wx.hideLoading()
        }
      })
    },
    // playOrStop() {
    //   if(this.playing){
    //     innerAudioContext.stop()
    //     clearInterval(interval)
    //     this.progress = 0
    //     currentTime = 0
    //   }else{
    //     innerAudioContext.play()
    //   }
    // },
  },
  onLoad(){
    // clearInterval(interval)
    // this.progress = 0
    // currentTime = 0
    this.getDetail()
    // innerAudioContext.onStop(() => {
    //   this.playing = false
    //   clearInterval(interval)
    //   this.progress = 0
    // })
    // innerAudioContext.onPlay(() => {
    //   this.playing = true
    //   currentTime = 0
    //   interval = setInterval(() => {
    //     const progress = currentTime / duration * 100
    //     this.progress = progress > 100 ? 100 : progress
    //     currentTime += 100
    //   }, 100)
    // })
    // innerAudioContext.onEnded(() => {
    //   this.playing = false
    //   clearInterval(interval)
    //   this.progress = 0
    // })
  },
  // onHide(){
  //   innerAudioContext.stop()
  //   clearInterval(interval)
  //   this.progress = 0
  //   currentTime = 0
  // },
  onUnload(){
    // innerAudioContext.stop()
    // clearInterval(interval)
    // this.progress = 0
    // currentTime = 0
    this.detailObj = {}
  }
}
</script>

<style lang="stylus" scoped>
.container
  height 100%
  width 90%
  padding 0 5%
  .para-title
    display flex
    align-items center
    font bold 32rpx/100rpx !specified
    color #424242
    div
      margin-right 20rpx
      height 45rpx
      width 10rpx
      background #011458
  .sub-info
    font 30rpx/50rpx !specified
    display flex
    align-items flex-start
    >div
      &:nth-child(1)
        color grey
        width 25%
      &:nth-child(2)
        width 75%
  .title
    font bold 42rpx/70rpx !specified
    margin 30rpx 0
  .info
    display flex
    justify-content space-between
    align-items center
    font 30rpx/50rpx !specified
    color grey
  audio
    height 90rpx
    width 100%
  .voice
    height 90rpx
    width 100%
    padding 0 30rpx
    margin 20rpx 0
    border-radius 6rpx
    background #FEFEFE
    border 1rpx solid #CCC
    display flex
    align-items center
    box-sizing border-box
    .play
      border-left 28rpx solid #444
      border-top 21rpx solid transparent
      border-bottom 21rpx solid transparent
    .stop
      background #444
      height 28rpx
      width 28rpx
    .text
      font 30rpx/30rpx !specified
      margin-left 30rpx
    .progress
      height 8rpx
      width 0
      margin-left 30rpx
      background #09BB07
  .detail
    margin 10rpx 0
    font 32rpx/40rpx !specified
    text-align justify
  .location
    font 30rpx/80rpx !specified
    color #E64340
  img
    width 100%
</style>

