// pages/mine/mine.js
import url from '../../utils/url.js'
var app = getApp(),
    openid = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    gender: '',
    phoneNumber: '',
    idCardNumber: '',
    carArray: []
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var profile = app.globalData.pInfo;
    openid = app.globalData.openid;
    this.setData({
      name: profile.name,
      gender: (profile.sex === 'M' ? '男' : '女'),
      phoneNumber: profile.telephone,
      idCardNumber: profile.ID.split('').slice(0, 13).concat(['*', '*', '*', '*', '*']).join('')
    })
    this.refreshCar()
  },
  refreshCar: function () {
    wx.showNavigationBarLoading()
    wx.request({
      url: url.fetchCarInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openid
      },
      success: res => {
        var cars = res.data.cinfo,
          carArray = [];
        app.globalData.cInfo = cars;
        for (var item in cars) {
          if (item !== 'count') {
            carArray.push(cars[item].carID)
          }
        }
        this.setData({
          carArray
        })
        console.log(carArray)
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          image: '../images/fail.png',
          duration: 800
        })
      },
      complete: () => {
        wx.hideNavigationBarLoading()
      }
    })
  },
  deleteCar: function (e) {
    console.log(e)
    var index = parseInt(e.currentTarget.id),
        carid = this.data.carArray[index];
    console.log(index, carid)
    wx.showModal({
      title: '删除车辆',
      content: '是否删除"' + carid + '"',
      confirmText: '删除',
      confirmColor: '#e94f4f',
      success: res => {
        if(res.confirm) {
          wx.request({
            url: url.deleteCar,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              openid,
              carid
            },
            success: res => {
              var newCarArray = this.data.carArray;
              console.log(res)
              if(res.data.msg === 'success') {
                this.refreshCar();
                wx.showToast({
                  title: '删除成功',
                  duration: 800
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误',
                image: '../images/fail.png',
                duration: 800
              })
            }
          })
        }
      }
    })
  } 
})