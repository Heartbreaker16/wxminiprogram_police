<template>
<form @submit='submit'>
<div class='container'>
<div class='text'>欢迎使用报警小程序</div>
<input v-if='register' v-model='name' name='name' placeholder='请输入您的姓名' maxlength=10>
<input type='idcard' v-if='register' v-model='idcard' name='idcard' placeholder='请输入您的身份证号' maxlength=18>
<input type='number' v-if='register' v-model='phone' name='phone' placeholder='请输入您的手机号' maxlength=11>
<input type='idcard' v-else v-model='account' name='account' placeholder='请输入您的手机号或身份证号' maxlength=18>
<input type='password' v-model='password' name='password' placeholder='请输入您的密码' maxlength=20>
<input type='password' v-if='register' v-model='password_confirm' name='password_confirm' placeholder='请确认您的密码' maxlength=20>
<button :disabled='!notEmpty || submitting' type='primary' form-type='submit' class='button'>{{register ? '注册' : '登录'}}</button>
<div class='text-bottom'>
<span v-if='!submitting' class='shift' @tap='clearInputs();shiftMode()'>{{register ? '登录账号' : '注册账号'}}</span>
<span class='phone-call' @tap='makePhoneCall'>电话报警</span>

</div>
<!-- <div style='font: 30rpx/30rpx false;'>{{error}}</div> -->
</div>
</form>
</template>

<script>
import checkIDCard from '@/utils/checkIDCard.js'
export default {
  data () {
    return {
      name: '',
      idcard: '',
      phone: '',
      account: '',
      password: '',
      password_confirm: '',
      register: true,
      submitting: false,
      error: ''
    }
  },
  computed:{
    notEmpty(){
      if(this.password){
        if(this.register){
          return this.name && this.phone && this.idcard
        }else{
          return this.account
        }
      }else{
        return false
      }
    }
  },
  methods: {
    makePhoneCall(){
      wx.makePhoneCall({
        phoneNumber: '110'
      })
    },
    clearInputs(){
      this.name = ''
      this.idcard = ''
      this.phone = ''
      this.account = ''
      this.password = ''
      this.password_confirm = ''
    },
    shiftMode(){
      this.register = !this.register
      wx.setNavigationBarTitle({title: this.register ? '注册' : '登录'})
    },
    getOpenID(){
      return new Promise( resolve => {
        if(!this.register) {
          resolve(false)
        }else{
          wx.login({
            success: res => {
              wx.request({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                data: {
                  js_code: res.code,
                  appid: 'wx4510a9a8853fa1c9',
                  secret: 'd758a69f9cd9baf36a5e52c60f37ec3c',
                  grant_type: 'authorization_code'
                },
                success: e => {
                  resolve(e.data.openid)
                },
                fail: err => {
                  resolve(false)
                }
              })
            },
            fail: res => {
              resolve(false)
            }
          })
        }
      })
    },
    submit(e){
      const input = e.mp.detail.value
      if(this.register && !checkIDCard(input.idcard)){
        wx.showToast({title:'请输入正确的身份证号', icon:'none'})
        return
      }
      if(this.register && input.password !== input.password_confirm){
        wx.showToast({title:'两次密码不一致',icon:'none'})
        this.password_confirm = ''
        return
      }
      this.submitting = true
      wx.showLoading({title: `正在${this.register ? '注册' : '登录'}`})
      this.getOpenID().then( openid => {
        wx.request({
          url: this.rootUrl + (this.register ? 'register' : 'login'),
          method: 'POST',
          data: {
            name: input.name,
            idcard: input.idcard,
            phone: input.phone,
            account: input.account,
            password: input.password,
            openid: openid ? openid : undefined
          },
          success: res => {
            console.log(res)
            this.error = JSON.stringify(res)
            wx.hideLoading()
            if(this.register){ //注册
              this.clearInputs()
              if(res.data === '注册成功')
                this.shiftMode()
              wx.showToast({title:res.data, icon:'none'})
            } else if (typeof res.data === 'string'){ //登录失败
              this.clearInputs()
              wx.showToast({title:res.data, icon:'none'})
            } else { // 登录成功
              wx.setStorageSync('userInfo', res.data)
              wx.redirectTo({url: '../homepage/main'})
            }
            this.submitting = false
          },
          fail: err => {
            console.log(err)
            this.error = JSON.stringify(err)
          }
        })
      })
    }
  },
  onUnload(){
    this.clearInputs()
    this.register = true
  }
}
</script>

<style lang="stylus" scoped>
.container
  position fixed
  height 100%
  width 100%
  display flex
  align-items center
  flex-direction column
  .text
    font 38rpx/38rpx !specified
    align-self flex-start
    margin 100rpx 10%
  input
    height 80rpx
    width 80%
    font 32rpx/32rpx !specified
    border-bottom 1rpx solid #DDD
    margin-bottom 30rpx
  button
    height 80rpx
    width 80%
    font 32rpx/80rpx !specified
  .text-bottom
    width 80%
    display flex
    justify-content space-between
    align-items center
    margin-top 50rpx
  .shift
    // position fixed
    // bottom 10%
    // align-self flex-start
    font 28rpx/28rpx !specified
    color #09BB07
  .phone-call
    font 28rpx/28rpx !specified
    color #E64340

</style>

