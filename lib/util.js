const config = require('../config/index.js')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取图片路径 param：图片名称带扩展名
const imgName = (imgNameWithExt = 'no.jpg') => {
  return `${config.imgPath}${imgNameWithExt}`
}
//api  param:根路径后面的路由
const api = {
  get: (url, query, notShowLoad) => {
    if (!notShowLoad) {
      wx.showLoading({
        mask: true,
      })
    }
    let sessionHead = {}
    sessionHead['content-type'] = 'application/x-www-form-urlencoded'
    sessionHead.token = wx.getStorageSync('user') ? wx.getStorageSync('user').token : ''
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.api}${url}`,
        // data: Object.assign({}, { userId: wx.getStorageSync('user') ? wx.getStorageSync('user').userId : '' }, query),
        data: query,
        method: 'GET',
        header: sessionHead,
        success(res) {
          if (res.statusCode == 200) {
            if (res.data.success) {
              resolve(res.data)
            } else {
              reject(res.data.message)
            }
            return
          }
          if (res.statusCode == 401) {
            reject('请登录')
            wx.removeStorageSync('listtip')
            wx.redirectTo({ url: '/pages/welcome2/welcome2' })
            return
          }
          reject(res.data, '请求成功')
        },
        fail(res) {
          console.error(res)
          reject(res.data, '请求失败')
        },
        complete() {
          if (!notShowLoad) {
            wx.hideLoading()
          }
        }
      })
    })
  },
  post: (url, body, head) => {
    wx.showLoading({
      mask: true,
    })
    let sessionHead = { 'content-type': 'application/x-www-form-urlencoded' }
    sessionHead.token = wx.getStorageSync('user') ? wx.getStorageSync('user').token : ''
    if (head) {
      sessionHead = Object.assign(sessionHead, head)
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.api}${url}`,
        // data: Object.assign({}, { userId: wx.getStorageSync('user') ? wx.getStorageSync('user').userId : '' }, body),
        data: body,
        method: 'POST',
        header: sessionHead,
        success(res) {
          console.log(res)
          if (res.statusCode == 200) {
            if (res.data.success) {
              resolve(res.data)
            } else {
              reject(res.data.message)
            }
            return
          }
          if (res.statusCode == 401) {
            reject('请登录')
            wx.removeStorageSync('listtip')
            wx.redirectTo({ url: '/pages/welcome2/welcome2' })
            return
          }
          reject(res.data, '请求成功')
        },
        fail(res) {
          console.error(res)
          reject(res.data, '请求失败')
        },
        complete() {
          wx.hideLoading()
        }
      })
    })
  }
}

//api 无用户id  param:根路径后面的路由
const apiPost = function (url, body, head) {
  wx.showLoading({
    mask: true,
  })
  let sessionHead = { 'content-type': 'application/x-www-form-urlencoded' }
  sessionHead.sessionid = wx.getStorageSync('user') ? wx.getStorageSync('user').sessionid : ''
  if (head) {
    sessionHead = Object.assign(sessionHead, head)
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.api}${url}`,
      data: Object.assign({}, body),
      method: 'POST',
      header: sessionHead,
      success(res) {
        if (res.statusCode == 200) {
          if (res.data.success) {
            resolve(res.data)
          } else {
            if (/请登录/.test(res.data.message)) {
              wx.redirectTo({ url: '/pages/welcome2/welcome2' })
            }
            reject(res.data.message)
          }
          return
        }
        reject(res.data, '请求成功')
      },
      fail(res) {
        reject(res.data, '请求失败')
      },
      complete() {
        wx.hideLoading()
      }
    })
  })
}


//获取用户权限
const getUserAuth = () => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (authsettings) => {
        resolve(authsettings.authSetting)
      },
      fail: () => {
        reject('获取用户权限失败')
      }
    })
  })
}
//获取用户信息
const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    getUserAuth()
      .then(authsettings => {
        console.log('授权信息', authsettings)
        if (authsettings['scope.userInfo'] == undefined) {
          wx.getUserInfo({
            withCredentials: true,
            lang: 'zh_CN',
            success: (userinfo) => {
              resolve(userinfo)
            },
            fail: () => {
              reject('用户信息未授权')
            }
          })
        } else if (authsettings['scope.userInfo'] == false) {
          reject('用户信息未授权')
        } else {
          wx.getUserInfo({
            withCredentials: true,
            lang: 'zh_CN',
            success: (userinfo) => {
              resolve(userinfo)
            },
            fail: () => {
              reject('用户信息获取失败')
            }
          })
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
//微信登录
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: function () {
        resolve(wx.getStorageSync('loginCode'))
      },
      fail: function () {
        wx.login({
          success(res) {
            if (res.code) {
              wx.setStorageSync('loginCode', res.code)
              resolve(res.code)
            } else {
              reject('获取用户登录态失败！')
            }
          },
          fail() {
            reject('调用登录态失败！')
          }
        });
      }
    })
  })
}

//手动授权方法
const authAgainByUser = (msg) => {
  wx.showModal({
    title: '提示',
    content: msg,
    success(res) {
      if (res.confirm) {
        wx.openSetting()
      }
    }
  })
}
//获取定位
const userLocation = () => {
  return new Promise((resolve, reject) => {
    getUserAuth()
      .then(authsettings => {
        if (authsettings['scope.userLocation'] == undefined) {
          wx.getLocation({
            type: 'gcj02',
            success: (location) => {
              resolve(location)
            },
            fail: () => {
              reject('用户位置未授权')
            }
          })
        } else if (authsettings['scope.userLocation'] == false) {
          reject('用户位置未授权')
        } else {
          wx.getLocation({
            type: 'gcj02',
            success: (location) => {
              resolve(location)
            },
            fail: () => {
              reject('用户位置获取失败')
            }
          })
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
const msgTip = {
  '没有该车': '该设备不存在！',
  'timeout': '超时了,请重试！'
}
//错误提示 用于不常见错误定位 param：错误信息
const alertTip = msg => {
  msg = msg ? msg.toString() : 'timeout'
  wx.showModal({
    title: '提示',
    content: msgTip[msg] ? msgTip[msg] : msg,
    showCancel: false
  })
}
const wxscan = function () {
  return new Promise((resolve, reject) => {
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) { resolve(res.result) },
      fail: function (res) { reject('扫码失败，重试') }
    })
  })
}
const mapApi = {
  getRoad(data, notShowLoad) {
    if (!notShowLoad) {
      wx.showLoading({
        mask: true,
      })
    }
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'GET',
        url: 'http://apis.map.qq.com/ws/direction/v1/walking/',
        data: Object.assign({}, data, { key: config.key }),
        success(res) {
          if (res.statusCode == 200) {
            if (res.data.status == 0) {
              let coors = res.data.result.routes[0].polyline
              for (var i = 2; i < coors.length; i++) {
                coors[i] = coors[i - 2] + coors[i] / 1000000
              }
              resolve(coors)
            } else {
              reject(res.data.message)
            }
            return
          }
          reject(res.data, '请求成功')
        },
        fail(res) {
          reject(res, '请求失败')
        },
        complete() {
          wx.hideLoading()
        }
      })
    })
  },
  getAdress(data, notShowLoad) {
    if (!notShowLoad) {
      wx.showLoading({
        mask: true,
      })
    }
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'GET',
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: Object.assign({}, data, { coord_type: 1, key: config.key }),
        success(res) {
          if (res.statusCode == 200) {
            if (res.data.status == 0) {
              resolve(res.data.result.address)
            } else {
              reject(res.data.message)
            }
            return
          }
          reject(res.data, '请求成功')
        },
        fail(res) {
          reject(res, '请求失败')
        },
        complete() {
          wx.hideLoading()
        }
      })
    })
  }
}

module.exports = {
  formatTime,
  imgName,
  api,
  getUserInfo,
  wxLogin,
  alertTip,
  msgTip,
  authAgainByUser,
  userLocation,
  mapApi,
  wxscan
}
