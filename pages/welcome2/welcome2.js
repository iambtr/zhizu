const { api, imgName, getUserInfo, wxLogin, alertTip, authAgainByUser } = require('../../lib/util.js')
Page({
  data: {
    //图片
    imgLogo: imgName('logo.png'),
    imgPerson: imgName('sign_in_phone_white.png'),
    imgLock: imgName('sign_in_password_white.png')
  },
  onLoad: function () {
    // wx.removeStorageSync('user')
  },
  formSubmit(e){
    // if (!/^1\d{10}/.test(e.detail.value.mobile)) {
    //   alertTip('请输入正确的手机号！')
    //   return false
    // }
    // if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/.test(e.detail.value.password)) {
    //   alertTip('请输入6-12位包含数字和字母的密码！')
    //   return false
    // }
    let { userName, password } = e.detail.value;
    if(userName&&password){
      api.get('user/logon', e.detail.value)
        .then(({ data }) => {
          wx.setStorageSync('user', data)
          switch(data.wUserMapp.type){
            case 1:
              wx.redirectTo({
                url: '/pages/user_index/user_index',
              })
            break;
            default:
             wx.redirectTo({
               url: '/pages/choose_point/choose_point',
              })
          }
        })
        .catch(err => {
          alertTip(err)
        })
      return
    }
    alertTip('用户名和密码不能为空！')
  }
})