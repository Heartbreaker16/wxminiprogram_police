<template>
<form class='container' @submit='submit' report-submit=true>
<div v-if='regular' class='subtitle'>标题</div>
<input v-if='regular' name='title' v-model='title' placeholder='请简短概括警情, 不超过20字' maxlength=20 />
<div class='subtitle'>事发地点</div>
<div class='location'>
<input :focus='locationFocus' name='location' v-model='location' 
  placeholder='请输入您的详细位置 (点击右侧图标直接获取)' maxlength=60 @focus='locationFocus=true' @blur='locationFocus=false'/>
<img src='/static/images/location.png' @tap='getLocation'/>
</div>
<div v-if='regular' class='subtitle'>案件类型</div>
<picker v-if='regular' :range='types' range-key='type' name='type' :class='{unselected: !hasSelect}' @change='pickerConfirm'>{{hasSelect ? types[typeIndex].type : '请选择案件类型'}}</picker>
<div class='subtitle'>{{ regular ? '警情描述' : '警情关键信息'}}</div>
<textarea name='detail' v-model='detail' :placeholder="regular ? '请详细描述警情' : '请输入警情关键信息，如您家的门牌号，车主的车牌号等，以协助警方尽快赶赴现场、锁定罪犯'" maxlength=500 />
<div class='subtitle'>添加录音 (选填)</div>
<div class='voice'>
  <div v-if='voiceFile' class='handle-record'>
    <div class='text'>{{duration}}</div>
    <div v-if='playing' class='stop' @tap='stop'/>
    <div v-else class='play' @tap='play'/>
    <img src='/static/images/delete.png' @tap='deleteVoice'/>
  </div>
  <div :class="{recording: statusText==='正在录音'}" class='start-record' @longpress='start' @touchend='stop' v-else-if='recordAuthorized' hover-class='fade'>{{statusText}}</div>
  <div class='start-record' @tap='authorize' v-else hover-class='hover'>点击授权录音</div>
</div>
<div class='subtitle'>添加图片 (选填)</div>
<div class='img-box'>
  <div class='image' v-for='(v,i) in imgfiles' :key='i' @tap='previewImg(i)'>
    <img :src='v'><div @tap.stop='cancelImg(i)'><img src='/static/images/cancel.png'></div>
  </div>
  <div hover-class='fade' @tap='chooseImage'><img class='upload' src='/static/images/upload.png'></div>
</div>
<div class='commit'>
  <button form-type='submit' type='warn' :disabled='empty || submitting'>提交</button>
</div>
<div>
</div>
</form>
</template>

<script>
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
let MSID = ''
let trueDuration = 0
let locationAuthorized = false
export default {
  data() {
    return {
      title: '',
      location: '',
      locationFocus: false,
      types: [],
      typeIndex: 0,
      hasSelect: false,
      detail: '',
      imgfiles: [],
      playing: false,
      statusText: '长按录音',
      recordAuthorized: false,
      duration: '',
      voiceFile: '',
      submitting: false,
      regular: false
    }
  },
  computed:{
    empty(){
      if(this.regular){
        return this.location === '' || this.detail === '' || this.title === '' || this.hasSelect === false
      } else {
        return this.location === '' || this.detail === ''
      }
    }
  },
  methods: {
    getLocation() {
      if(locationAuthorized){
        wx.showLoading({ title: '正在定位' })
      }
      wx.getLocation({
        type: 'gcj02',
        success: res => {
          wx.request({
            url: 'https://api.map.baidu.com/geocoder/v2/',
            data: {
              ak: 'AnWpq9Kc3C8cq5CCGAzsq3NxpBkxRnl0',
              location: `${res.latitude},${res.longitude}`,
              coordtype: 'gcj02ll',
              output: 'json'
            },
            success: res1 => {
              console.log(res1)
              this.location = res1.data.result.formatted_address
              this.locationFocus = true
              wx.hideLoading()
            }
          })
        },
        fail: err => {
          let authSetting
          wx.getSetting({
            success: res => {
              authSetting = res.authSetting['scope.userLocation']
            },
            complete: () => {
              if (authSetting) {
                wx.showModal({
                  title: '定位失败',
                  content: '微信未获得位置权限\n请在您手机的系统设置-权限管理中，打开微信的位置信息获取权限',
                  showCancel: false,
                  success: res => {
                    if (res.confirm) {
                      wx.hideLoading()
                    }
                  }
                })
              } else {
                wx.hideLoading()
                wx.showModal({
                  title: '授权请求',
                  content: '您已拒绝小程序获取地理位置，若要使用定位功能，请重新授权',
                  showCancel: false,
                  success: res => {
                    if (res.confirm) {
                      wx.openSetting({
                        success: res => {
                          if (res.authSetting['scope.userLocation']) {
                            locationAuthorized = true
                            this.getLocation()
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      })
    },
    pickerConfirm(e){
      this.typeIndex = e.mp.detail.value
      this.hasSelect = true
    },
    start() {
      if(this.statusText !== '点击授权录音'){
        recorderManager.start()
        recorderManager.onStart(() => {
          this.statusText = '正在录音'
        })
      }
    },
    stop() {
      if(this.voiceFile){
        innerAudioContext.stop()
      }else {
        recorderManager.stop()
        recorderManager.onStop( res => {
          innerAudioContext.src = res.tempFilePath
          trueDuration = res.duration
          this.duration = parseInt( trueDuration / 1000 + 1) + 's'
          this.voiceFile = res.tempFilePath
          this.statusText = '长按录音'
        })
      }
    },
    play() {
      innerAudioContext.play()
      innerAudioContext.onPlay(() => {
        this.playing = true
      })
      innerAudioContext.onEnded(() => {
        this.playing = false
      })
    },
    deleteVoice(){
      innerAudioContext.stop()
      wx.showModal({
        title: '',
        content: '确认要删除录音吗？',
        success: res => {
          if(res.confirm){
            innerAudioContext.src = ''
            this.voiceFile = ''
          }
        }
      })
    },
    chooseImage(e) {
      const count = 5 - this.imgfiles.length
      if(count==0){
        if(!wx.showModal({
          title: '上传限制',
          content: '图片数量上限为5张\n请删除部分图片后再上传新图片',
          showCancel: false,
          success: res=>{
            if(res.confirm){return false}
          }
        })){return}
      }
      wx.chooseImage({
        count,
        sizeType: ['compressed'],
        success: res => {
          this.imgfiles = this.imgfiles.concat(res.tempFilePaths)
        }
      })
    },
    cancelImg(i){
      wx.showModal({
        title:'',
        content: '放弃上传这张照片吗?',
        success: res => {
          if(res.confirm){
            this.imgfiles.splice(i, 1)
          }
        }
      })
    },
    authorize(){
      wx.authorize({
        scope: 'scope.record',
        success: () => {
          this.recordAuthorized = true
        },
        fail: err => {
          wx.showModal({
            title: '授权请求',
            content: '您已拒绝小程序使用录音，若要使用录音功能，请重新授权',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success: res => {
                    if (res.authSetting['scope.record']) {
                      this.recordAuthorized = true
                    }
                  }
                })
              }
            }
          })
        }
      })
    },
    previewImg(i){
      wx.previewImage({
        urls: this.imgfiles,
        current: this.imgfiles[i]
      })
    },
    submit(e) {
      const input = e.mp.detail.value
      wx.showModal({
        title:'',
        content: '确认要提交吗？',
        success: res => {
          if(res.confirm){
            this.submitting = true
            wx.showLoading({title: '正在上传'})
            wx.request({
              url: this.rootUrl + 'addMsg',
              method: 'POST',
              data: {
                title: input.title,
                location: input.location,
                TPID:  input.type ? this.types[input.type].TPID : undefined,
                detail: input.detail,
                USID: wx.getStorageSync('userInfo').id,
                form_id: e.mp.detail.formId
              },
              success: res => {
                MSID = res.data.MSID
                if(MSID){
                  if(this.voiceFile){
                    this.uploadVoice()
                  }else if(this.imgfiles.length > 0){
                    this.uploadImg()
                  }else{
                    this.clearData()
                  }
                }
              }
            })
          }
        }
      })
    },
    uploadVoice(){
      wx.showLoading({title: '正在上传录音'})
      wx.uploadFile({
        url: this.rootUrl + 'addVoice',
        filePath: this.voiceFile,
        formData: { 
          MSID,
          duration: trueDuration
        },
        name: 'voice',
        header: {
          'content-type': 'multipart/form-data'
        },
        success: res => {
          if(res.data === 'ok'){
            if(this.imgfiles.length > 0){
              this.uploadImg()
            }else{
              this.clearData()
            }
          }
        }
      })
    },
    uploadImg(){
      wx.showLoading({title: '正在上传图片'})
      let counter = this.imgfiles.length
      for(let i = 0; i < this.imgfiles.length; i++){
        wx.uploadFile({
          url: this.rootUrl + 'addImg',
          filePath: this.imgfiles[i],
          formData: { MSID },
          name: 'case',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: res => {
            if(--counter === 0){
              this.clearData()
            }
          }
        })
      }
    },
    clearData(){
      this.title = ''
      this.location = ''
      this.typeIndex = 0
      this.hasSelect = false
      this.detail = ''
      this.voiceFile = ''
      this.imgfiles = []
      this.submitting = false
      wx.hideLoading()
      wx.showToast({title:'上传成功'})
    },
    getTypes(){
      wx.request({
        url: this.rootUrl + 'allTypes',
        success: res => {
          this.types = res.data
        }
      })
    }
  },
  onLoad(){
    this.getTypes()
    const type = this.$root.$mp.query.type
    this.regular = type === 'regular'
    if(this.regular){
      wx.setNavigationBarTitle({ title: '常规报警' })
    }else{
      wx.setNavigationBarTitle({ title: '紧急报警' })
      this.getLocation()
    }
    wx.getSetting({
      success: res => {
        console.log('www',res.authSetting['scope.record'])
        this.recordAuthorized = res.authSetting['scope.record']
        locationAuthorized = res.authSetting['scope.userLocation']
      }
    })
    innerAudioContext.onStop(() => {
      this.playing = false
    })
  },
  onHide(){
    innerAudioContext.stop()
  },
  onUnload(){
    innerAudioContext.stop()
  }
}
</script>

<style lang='stylus' scoped>
.container
  // height 100%
  // width 100%
  .subtitle
    height 70rpx
    padding 0 20rpx
    display flex
    justify-content space-between
    align-items center
    font 30rpx/30rpx !specified
    background #EEE
    // background MediumSlateBlue
    color grey
    border-top 1rpx solid #DDD
    border-bottom  1rpx solid #DDD
  input, textarea
    height 50rpx
    margin 20rpx
    font 30rpx/30rpx !specified
  picker
    height 30rpx
    margin 30rpx
    font 30rpx/30rpx !specified
  .unselected
    color grey
  .location
    display flex
    align-items center
    input
      width calc(100% - 110rpx)
    img
      width 54rpx
      height 54rpx
  textarea
    height 300rpx
    width calc(100% - 40rpx)
    line-height 50rpx
  .img-box
    display flex
    flex-wrap wrap
    padding 0 30rpx 30rpx 30rpx
    width 100%
    box-sizing border-box
    >div
      height 150rpx
      width 150rpx
      margin-top calc(((100% - 150rpx * 4) / 3))
      background #F4F5F9
      &:nth-child(4n+1), &:nth-child(4n+2), &:nth-child(4n+3)
        margin-right calc(((100% - 150rpx * 4) / 3))
      .upload
        height 40%
        width 40%
        margin 30% 0 0 30%
    .image
      position relative
      >img
        height 100%
        width 100%
      div
        position absolute
        top 0
        right 0
        opacity .5
        background black
        height 20%
        width 20%
        border-radius 0 0 0 10rpx
        display flex
        justify-content center
        align-items center
        img
          height 60%
          width 60%
  .commit
    height 150rpx
    width 100%
    padding 40rpx calc(((100% - 250rpx) / 2))
    box-sizing border-box
    button
      height 100%
      width 100%
      font 33rpx/70rpx !specified
  .voice
    height 110rpx
    .start-record
      height 100%
      padding 0 20rpx
      display flex
      justify-content center
      align-items center
      font 36rpx/36rpx !specified
    .handle-record
      height 100%
      padding 0 20rpx
      display flex
      justify-content flex-end
      align-items center
      .text
        margin 0 auto 0 0
        font 30rpx/30rpx !specified
      .play
        border-left 34rpx solid #333
        border-top 21rpx solid transparent
        border-bottom 21rpx solid transparent
      .stop
        background #333
        height 30rpx
        width 30rpx
      img
        height 40rpx
        width 40rpx
        margin-left 20rpx
    .recording
      background #E64340
      opacity .6
      color white
</style>