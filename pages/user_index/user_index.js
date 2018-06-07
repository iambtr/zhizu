const config = require('../../config/index.js')
const { api, mapApi, imgName, getUserInfo, wxLogin, alertTip, wxscan, authAgainByUser, userLocation } = require('../../lib/util.js')

let carTimer = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tab: '',//tab是列表
    //详情页数据
    carLists: [
      /**{
       
      }*/
    ],
    role:1,//角色 录车1 和 收车0
    siteId:null,
    frameNo:'',
    hasPoint:true,
    vcuNo: '',
    licensePlate: '',
    user:null,
    imgScan:imgName('imgscan.png'),
    // mode:false,//录入模式
    typeIndex:0,
    modifyIndex:0,
    modify:false,//修改模式
    carOarray: [],//原始车型类别
    carArray: []
  },
  onShow:function(){
    // 录车
    if(this.data.role==1){
      this.freshCar()
    }    
  },
  onUnload(){
    wx.removeStorageSync('listtip')
  },
  //tab切换
  tabCarMenu(e) {
    let id = e.target.id
    if (e.target.id === this.data.tab) return
    let tab = this.data.tab === '' ? 'tab' : ''
    if(tab){
      if(!wx.getStorageSync('listtip')){
        alertTip('左右滑动显示更多车型信息')
        wx.setStorageSync('listtip', 'has')
      }
    }
    this.setData({
      tab
    })
  },
  onLoad: function () {
    let carLists = wx.getStorageSync('carLists')
    let user = wx.getStorageSync('user').wUserMapp

    let role = user.type
    if (!carLists) {
       carLists = [] 
    }else{
      // 入车和收车数据不一致时 删除数据
      if (!((role == 1 && carLists[0] && carLists[0].vcuNo) || (role == 0 && carLists[0]&&!carLists[0].vcuNo))){
        carLists = [] 
        wx.setStorageSync('carLists', [])
      }
    }
    //收车时要先判断 有没有siteId
    if(role==0){
      let siteId=wx.getStorageSync('siteId')
      if(!siteId){
        wx.reLaunch({
          url: '/pages/welcome2/welcome2',
        })
        return 
      }else{
        this.setData({
          siteId
        })
      }
    }
    this.setData({
      carLists,
      role,
      user
    })

    wx.setNavigationBarTitle({
      title: `${role==1?"录车":"交车"}操作员：${user.userName}`
    })
  },
  onUnload() {
    wx.setStorageSync('carLists', this.data.carLists)
  },
  // beQuick(e) {
  //   if(!this.data.mode){
  //     alertTip(`快速录车模式下将锁定车型为${this.data.carArray[this.data.typeIndex]},先扫描车架号，再扫描中控号`)
  //   }
  //   this.setData({
  //     mode: e.detail.value
  //   })
  // },
  carTypeChange(e){
    this.setData({
      typeIndex: e.detail.value
    })
  },
  scanCarCode(e) {
    let tar = e.target.id.substring(1)
    let that=this
    wxscan()
      .then(no=>{
        that.setData({
          [tar]:no
        })
      })
      .catch()
  },
  numInput(e) {
    this.setData({
      [e.target.id]: e.detail.value
    })
  },
  resetData(){
    this.setData({
      frameNo: '',
      vcuNo: '',
      licensePlate: '',
      typeIndex: 0,
    })
  },
  //保存数据
  saveCarList(){
    if (this.checkInput()){
      //录车
      if(this.data.role==1){
        this.data.carLists.push({
         licensePlate : this.data.licensePlate,
        vcuNo : this.data.vcuNo,
          frameNo: this.data.frameNo,
          vehicleType: this.data.carArray[this.data.typeIndex],
          vehicleModelId: this.data.carOarray[this.data.typeIndex].id
        })
      }else{
        //收车
        this.data.carLists.push({
          frameNo: this.data.frameNo,
          siteId: String(this.data.siteId)
        })
      }
     
      this.setData({
        carLists: this.data.carLists,
        licensePlate: '',
        frameNo: '',
        vcuNo: ''
      })
      console.log('保存', this.data.carLists)
    }
    
  },
  //检验数据
  checkData(typeNo,no){
    switch(typeNo){
      case 0:
       return this.data.carLists.some(item=>{
          return item.frameNo==no
        })
      break;
      default:
       return this.data.carLists.some(item => {
          return item.vcuNo == no
        })

    }
  },
  addCar(){
    this.saveCarList()
  },
  modifyItem(e){
    let frame=e.target.id
    let index=this.data.carLists.findIndex(item=>{
      return item.frameNo == frame
    })
    //录车
    if(this.data.role==1){
      this.setData({
        licensePlate: this.data.carLists[index].licensePlate,
        frameNo: this.data.carLists[index].frameNo,
        vcuNo: this.data.carLists[index].vcuNo,
        modify: true,
        modifyIndex: index,
        typeIndex: this.data.carArray.indexOf(this.data.carLists[index].vehicleType) > 0 ? this.data.carArray.indexOf(this.data.carLists[index].vehicleType) : 0,
        tab: ''
      })
    }else{
      this.setData({
        frameNo: this.data.carLists[index].frameNo,
        modify: true,
        modifyIndex: index,
        tab: ''
      })
    }
   
  },
  removeItem(e){
    let frame = e.target.id
    this.setData({
      carLists: this.data.carLists.filter(item=>{
        return item.frameNo != frame
      })
    })
  },
  cancelModify(){
    this.setData({
      licensePlate: '',
      frameNo: '',
      vcuNo: '',
      mode: false,
      modify: false,
      typeIndex: 0,
      tab: 'tab'
    })
  },
  sureModify(){
    if (this.checkInput()) {
      //录车
      let mItem = this.data.carLists[this.data.modifyIndex]
      if(this.data.role==1){
        mItem.licensePlate = this.data.licensePlate
        mItem.frameNo = this.data.frameNo
        mItem.vcuNo = this.data.vcuNo
        mItem.vehicleType = this.data.carArray[this.data.typeIndex]
        mItem.vehicleModelId = this.data.carOarray[this.data.typeIndex].id
      }else{
        mItem.frameNo = this.data.frameNo
      }
     
      this.setData({
        carLists: this.data.carLists
      })
      this.cancelModify()
    }
  },
  freshCar(){
    let that =this
    let user=wx.getStorageSync('user').wUserMapp
    if(!user){
      wx.redirectTo({
        url: '/pages/welcome2/welcome2',
      })
      return
    }
    api.get('vehicle/getVehicleModel')
      .then(({ items })=>{
        let carArray=items.map(item=>{
          return `${item.model}-${item.version}-${item.code}`
        })
        that.setData({
          carOarray:items,
          carArray,
          user
        })
      })
      .catch(msg=>{
        alertTip(msg)
      })
  },
  submitList(){
    let that=this
    let { carLists, user}=this.data
    if (carLists.length==0){
      alertTip('还没有录入车辆')
      return
    }
    //录车
    if(this.data.role==1){
      api.post('vehicle/entry', {
        data: JSON.stringify(carLists),
        userId: user.userId
      })
        .then(res => {
          alertTip(res.message)
          that.setData({
            licensePlate: '',
            frameNo: '',
            vcuNo: '',
            carLists: [],
            modify: false,
            typeIndex: 0,
            tab: 'tab'
          })
          wx.removeStorageSync('carLists')
        })
        .catch(err => {
          alertTip(err)
        })
    }else{
      api.post('check/check', {
        data: JSON.stringify(carLists),
        userId: user.userId
      })
        .then(res => {
          alertTip(res.message)
          that.setData({
            licensePlate: '',
            frameNo: '',
            vcuNo: '',
            carLists: [],
            modify: false,
            typeIndex: 0,
            tab: 'tab'
          })
          wx.removeStorageSync('carLists')
        })
        .catch(err => {
          alertTip(err)
        })
    }
   
  },
  checkInput(){
    if (this.data.frameNo == '') {
      alertTip('请录入车架号')
      return false
    }
    //录车时判断中空号
    if(this.data.role==1){
      if (this.data.vcuNo == '') {
        alertTip('请录入中控号')
        return false
      }
    }
    let that = this
    let exist = that.checkData(0, that.data.frameNo)
    if (exist) {
      alertTip('已经录入过该车架号')
      return false
    }
    //录车时检验中控号
    if (that.data.role == 1) {
      let exist2 = that.checkData(1, that.data.vcuNo)
      if (exist2) {
        alertTip('已经录入过该中控号')
        return false
      }
    }
    return true
  },
  //重选网点
  repoint(){
    wx.navigateTo({
      url: '/pages/choose_point/choose_point',
    })
  }
})