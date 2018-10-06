// pages/createOrder/createOrder.js
import url from '../../utils/url.js'
import utils from '../../utils/util.js'
var app = getApp(),
    Validator = {
      name: function (value) {
        if(value.trim().length === 0) {
          return '请输入姓名'
        }
        return '';
      },
      studentid: function (value) {
        if(value.trim().length !== 10) {
          return '学工号不存在'
        }
        return '';
      },
      caruid: function (value) {
        if(this.data.option !== 0 && value.trim().length === 0) {
          return '请选择车牌号'
        }
        return '';
      }
    }
Page({
  onShow: function () {
    var cInfo = app.globalData.cInfo,
        carArray = [],
        date = utils.getDate();
        console.log(date)
    if(cInfo) {
     for(var car in cInfo) {
       if(car !== 'count') {
         carArray.push(cInfo[car].carID)
       }
     }
     this.setData({
       carArray: carArray,
       carNumber: carArray[0]
     })
    }
    this.setData({
      date
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    errMsg: '',
    withCar: 0,
    name: '张翰飞',
    id: '2016212897',
    date: '',
    carNumber: '',
    carArray: [],
    identityItems: [
      {name: "驾驶员", value: 2, checked: true},
      {name: "乘客", value: 1}
    ]
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var identityItems = this.data.identityItems;
    for (var i = 0, len = identityItems.length; i < len; ++i) {
      identityItems[i].checked = identityItems[i].value == e.detail.value;
    }

    this.setData({
      identityItems: identityItems,
      withCar: parseInt(e.detail.value)
    });
  },
  inputChange: function (e) {
    var target = e.target.id,
        value = e.detail.value,
        newObj = {};
    newObj[target] = value;
    this.setData(newObj)
  },
  inputBlur: function () {

  },
  switchChange: function (e) {
    var checked = e.detail.value,
        identityItems = this.data.identityItems,
        withCar = 0;
    if(checked) {
      for (var i = 0, len = identityItems.length; i < len; ++i) {
        if(identityItems[i].checked) {
          withCar = identityItems[i].value;
        }
      }
    }
    this.setData({
      withCar
    })
  },
  dateChange: function (e) {
    var date = e.detail.value;
    console.log("date: ", date);
    this.setData({
      date
    })
  },
  carChange: function (e) {
    console.log(e)
    this.setData({
      carNumber: this.data.carArray[e.detail.value]
    })
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
  submitOrder: function () {
    var msg = '',
        dataObj = {
          name: this.data.name,
          openid: app.globalData.openid,
          studentid: this.data.id,
          reservedate: this.data.date,
          option: this.data.withCar
        };
    if(dataObj.option) {
      dataObj.caruid = this.data.carNumber
    }
    
    for(var item in dataObj) {
      if(Validator[item]) {
        msg = Validator[item].call(this, dataObj[item]);
        if(msg !== '') {
          this.showTips(msg)
          return '';
        }
      }
    }
    console.log(dataObj)
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    wx.request({
      url: url.verifyUserInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openid: dataObj.openid,
        id: dataObj.studentid,
        name: dataObj.name
      },
      success: res => {
        var msg = res.data.status,
            tips = ['', "被访者未注册", "被访者不存在"];
        if(msg) { 
          wx.hideLoading();
          this.showTips(tips[msg])
        } else {
          delete dataObj.name
          wx.request({
            url: url.verifyPinfo,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: dataObj,
            success: res => {
              wx.hideLoading()
              if(res.data.msg === 'success') {
                wx.showToast({
                  title: '提交成功',
                  duration: 800
                })
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 800)
              } else {
                wx.showToast({
                  title: '提交失败',
                  image: '../images/fail.png',
                  duration: 800
                })
              }
            }
          })
        }
      },
      fail: res => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误',
          image: '../images/fail.png',
          duration: 800
        })
      }
    })
  },
  addCar: () => {
    wx.navigateTo({
      url: '../addCar/addCar',
    })
  }
})