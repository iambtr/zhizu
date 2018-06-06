// pages/choose_point/choose_point.js
const { api, alertTip } = require('../../lib/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyArray: ['未获取'],
    companyIndex: 0,//一级网点
    pointArray: ['未获取'],
    pointIndex: 0,//二级网点
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    this.getCompany()
  },
  //一级网点变化
  companyChange(e) {
    this.setData({
      companyIndex: e.detail.value
    })
    let company = this.data.companyArray[this.data.companyIndex]
    this.getPoints(company.id)
  },
  //二级网点变化
  pointChange(e) {
    console.log(e)
    this.setData({
      pointIndex: e.detail.value
    })
    // let point = this.data.pointArray[this.data.pointIndex]
  },
  //获取一级网点
  getCompany() {
    let that = this
    api.get('company/getByCompany')
      .then(({ items }) => {
        that.setData({
          companyArray: items
        })
        that.getPoints(items[0].id)
      })
      .catch(err => {
        alertTip(err)
      })
  },
  //获取2级网点
  getPoints(companyId) {
    let that = this
    api.get('site/getByCompanyId', { companyId })
      .then(({ items }) => {
        if(items.length==0){
          alertTip('该一级网点下不存在二级网点，请联系管理员')
        }
        that.setData({
          pointArray: items
        })
      })
      .catch(err => {
        alertTip(err)
      })
  },
  surePoint(){
    let point = this.data.pointArray[this.data.pointIndex]
    if (point && point.companyName){
      wx.showModal({
        title: '提示',
        content: `确认您的二级网点是${point.companyName}`,
        success: function (res) {
          if (res.confirm) {
            wx.setStorageSync('siteId', point.id)
            wx.redirectTo({
              url: '/pages/user_index/user_index',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    alertTip('二级网点异常，请联系管理员')
  }
})