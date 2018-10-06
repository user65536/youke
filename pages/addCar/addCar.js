// pages/addCar/addCar.js
import url from '../../utils/url.js'
var app = getApp(),
    openid = '',
    Validator = {
      carId: function (value) {
        if(value.trim().length < 7) {
          return '车牌号错误'
        }
        return ''
      }
    };
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    errMsg: '',
    carId: '',
    carType: 1,
    carTypes: [
      {name: "小型车", value: 1, checked: true},
      {name: "大型车", value: 2}
    ]
  },
  onShow: function () {
    openid = app.globalData.openid
  },
  inputChange: function (e) {
    this.setData({
      carId: e.detail.value
    })
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var carTypes = this.data.carTypes;
    for (var i = 0, len = carTypes.length; i < len; ++i) {
      carTypes[i].checked = carTypes[i].value == e.detail.value;
    }

    this.setData({
      carTypes: carTypes,
      carType: parseInt(e.detail.value)
    });
  },
  showTips: function (msg) {
    this.setData({
      showTopTips: true,
      errMsg: msg
    })
    setTimeout(() => {
      this.setData({
        showTopTips: false
      })
    }, 1500)
  },
  submitCar: function () {
    var msg = Validator.carId(this.data.carId);
    if(msg !== '') {
      this.showTips(msg)
    } else {
      wx.showLoading({
        title: '提交中',
      })
      wx.request({
        url: url.addNewCar,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          carid: this.data.carId,
          openid: openid,
          cartype: this.data.carType
        },
        success: res => {
          if(res.data.msg === "success") {
            wx.request({
              url: url.fetchCarInfo,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              data: {
                openid: openid
              },
              success: res => {
                console.log(res)
                var cInfo = res.data.cinfo;
                app.globalData.cInfo = cInfo;
                wx.hideLoading()
                wx.showToast({
                  title: '提交成功',
                  duration: 800
                })
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 800)
              },
              fail: () => {
                wx.hideLoading();
                wx.showModal({
                  title: '警告',
                  content: '网络错误，请检查网络设置',
                  showCancel: false
                })
              }
            })
          }
        }
      })
    }
  }
})