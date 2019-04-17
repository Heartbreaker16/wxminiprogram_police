<template>
<div class='container'>
<div class='head'>
  <img src='/static/images/avatar.png' @tap='logOut'>
  <div>{{name}}</div>
</div>
<!-- <button open-type="getUserInfo" type="primary" @getuserinfo="bindGetUserInfo" >开始使用</button> -->
<div class='red' @tap='showMask=true' hover-class='fade'><img src='/static/images/alert.png'>线上报警</div>
<navigator class='blue' @tap='makePhoneCall'><img src='/static/images/phone.png'>电话报警</navigator>
<navigator url='../history/main' class='green'><img src='/static/images/record.png'>报警记录</navigator>
<navigator url='../news/main' class='green'><img src='/static/images/news.png'>警务资讯</navigator>
<div class='footer'>Copyright © 2019 ZhengDonghang</div>

<div v-if='showMask' class='mask' @tap='showMask=false'/>
<div v-if='showMask' class='select'>
  <navigator url='../commit/main?type=regular'><div class='regular'><img src='/static/images/regular.png'></div>常规报警</navigator>
  <navigator url='../commit/main?type=emergency'><div class='emergency'><img src='/static/images/emergency.png'></div>紧急报警</navigator>
</div>

<div v-if='showWarning' class='warn mask'>
  <div class='warning'>
    <div class='title'>报警须知</div>
    <div class='text'>
      1. 遇有紧急情况，请直接拨打110报警或点击页面上的"电话报警";<br>&nbsp;<br>
      2. 线上报警请按提示填写报警内容，应尽可能提供准确详尽的信息;<br>&nbsp;<br>
      3. 微信上传的文字、语音、照片将被系统自动记录并提供给有关部门，务必确保真实有效;<br>&nbsp;<br>
      4. 对故意谎报警情，扰乱公安机关正常办公秩序的，将依法追究法律责任;<br>
    </div>
    <button type='warn' @tap='confirmWarn'>我已阅读并同意</button>
  </div>
</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      showMask: false,
      showWarning: false
    }
  },
  methods: {
    makePhoneCall(){
      wx.makePhoneCall({
        phoneNumber: '110'
      })
    },
    confirmWarn(){
      this.showWarning = false
      wx.setStorageSync('hasReadWarning', true)
    },
    logOut(){
      wx.showActionSheet({
        itemList: ['退出登录'],
        success: res => {
          if(res.tapIndex === 0){
            wx.showModal({
              title: '',
              content: '确定要退出登录吗？',
              success: res => {
                if(res.confirm){
                  wx.removeStorageSync('userInfo')
                  wx.removeStorageSync('hasReadWarning')
                  wx.redirectTo({url: '../login/main'})
                }
              }
            })
          }
        },
      })
    }
  },
  onLoad(){
    const userInfo = wx.getStorageSync('userInfo')
    if(userInfo){
      this.name = userInfo.name
      if(!wx.getStorageSync('hasReadWarning'))
        this.showWarning = true
    }else wx.redirectTo({url: '../login/main'})
  },
  onShow(){
    this.showMask = false
  }
}
</script>

<style lang="stylus" scoped>
.container
  position fixed
  height 100%
  width 100%
  .head
    height 40%
    background #011458
    display flex
    align-items center
    font 40rpx/40rpx !specified
    color white
    img
      height 180rpx
      width 180rpx
      margin 0 40rpx
  >navigator, .red
    display inline-flex
    justify-content center
    align-items center
    flex-direction column
    height 24%
    width 50%
    font 36rpx/36rpx !specified
    img
      height 100rpx
      width 100rpx
      margin-bottom 40rpx
  .footer
    position fixed
    bottom 3%
    width 100%
    font 26rpx/26rpx !specified
    color #808080
    text-align center
  .mask
    position fixed
    height 100%
    width 100%
    top 0
    left 0
    background black
    opacity .5
  .select
    position fixed
    height 25%
    width 80%
    top 35%
    left 10%
    background white
    border-radius 20rpx
    navigator
      display inline-flex
      justify-content center
      align-items center
      flex-direction column
      height 100%
      width 50%
      font 34rpx/34rpx !specified
      div
        height 120rpx
        width 120rpx
        border-radius 50%
        margin-bottom 30rpx
        display flex
        justify-content center
        align-items center
        img
          height 60%
          width 60%
        &.regular
          background #00C
        &.emergency
          background #C00
  .warn
    display flex
    justify-content center
    align-items center
    background rgba(0,0,0,.5)
    opacity 1
    .warning
      width 80%
      background white
      border-radius 20rpx
      padding 50rpx 30rpx
      box-sizing border-box
      .title
        font bold 34rpx/34rpx !specified
      .text
        text-align justify
        font 30rpx/40rpx !specified
        margin 30rpx 0
      button
        width 100%
</style>

