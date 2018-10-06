// pages/order/order.js
import url from '../../utils/url.js'
var app = getApp(),
    openid = '',
    getOrderList = app.getOrderList,
    handleList = app.handleList;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    topTips: "",
    tipsMode: 'warn',
    hasCode: false,
    caseID: '',
    code: ''
  },
  /**
   * 用户点击右上角分享
   */
  onShow: function () {
    wx.startPullDownRefresh()
  },
  onShareAppMessage: function () {
    
  },
  onPullDownRefresh: function () {
    console.log("pulldown")
    getOrderList((orders) => {
      console.log(orders)
      var currentOrder = orders[0];
      if(currentOrder.statusCode !== 0) {
        wx.stopPullDownRefresh();
        this.showTips('最近一次预约' + currentOrder.msg, 'warn')
        this.setData({
          hasCode: false
        })
      } else {
        wx.request({
          url: url.getqrcode,
          method: "POST",
          header: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          data: {
            caseid: currentOrder.caseID
          },
          success: (res) => {
            console.log(res)
            wx.stopPullDownRefresh();
            this.showTips('最近一次预约' + currentOrder.msg, 'success')
            this.setData({
              hasCode: true,
              caseID: currentOrder.caseID,
              code: res.data
            })
          }
        })
      }
    });
  },
  showTips: function (msg, mode) {
    this.setData({
      showTopTips: true,
      topTips: msg,
      tipsMode: mode
    });
    setTimeout(() => {
      this.setData({
        showTopTips: false
      });
    }, 1500);
  },
  createNewOrder: () => {
    wx.navigateTo({
      url: '../createOrder/createOrder',
    })
  }
})