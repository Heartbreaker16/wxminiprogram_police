const request = require('request')
// wx.login({
//   success: res => {
//     wx.request({
//       url: 'http://47.104.11.101:8080/lawyerApp//Login/getOpenid',
//       method: 'POST',
//       data: {
//         code: res.code,
//         app_id,
//         secret,
//       },
//       success: function(e) {
//         resolve(e.data)
//       },
//       fail: function(err) {
//         resolve(err)
//       }
//     })
//   },
//   fail: res => {
//     resolve(res)
//   }
// })
// request.post(
//     {
//       url: 'http://47.104.11.101:8080/lawyerApp/Login/getOpenid',
//       form: {

//       }
//     },
//     (err, res, body) => {
//       console.log(res)
//     }
//   )
// return
request.get(
  {
    url:'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx664c5691c59f352a&secret=59ae4b1097a756a583e7e2b09da36411'
  },
  (err, res, body) => {
    if(err) throw err
    request.post(
      {
        url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${
          JSON.parse(body).access_token
        }`,
        header: { 'content-type': 'application/json' },
        json: {
          touser: 'o9ARd5eEJvacQSXSTvUEvsR_JEzU',
          template_id: '8BrzJ-brWgY6odiMqWSURY2USluCpdTyt6PnC1bX-r8',
          form_id: 'b2a3740613c04d0e803d5a3a006bc264',
          data: {
            keyword1: {
              value: 'ss'
            },
            keyword2: {
              value: 'd'
            },
            keyword3: {
              value: 'd'
            },
            keyword4: {
              value: 'dddd'
            },
            keyword5: {
              value: 'efef'
            }
          }
        }
      },
      (err, res, body) => {
        console.log(res)
      }
    )
  }
)
