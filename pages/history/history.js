// pages/history/history.js
var app = getApp(),
    getOrderList = app.getOrderList
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history: null
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showNavigationBarLoading();
    getOrderList((list) => {
      wx.hideNavigationBarLoading();
      this.setData({
        history: list
      })
    })
  },

  createNewOrder: () => {
    wx.navigateTo({
      url: '../createOrder/createOrder',
    })
  }
})