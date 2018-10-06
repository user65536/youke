// pages/welcome/welcome.js
Page({
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindInfo: () => {
    var registerType = '';
    wx.showModal({
      title: '提示',
      content: '可使用身份证照片快速识别',
      cancelText: '手动填写',
      confirmText: '快速识别',
      success: resType => {
        registerType = resType.confirm ? 'idcard' : 'normal',
          wx.navigateTo({
            url: '../bindInfo/bindInfo?type=' + registerType,
          })
      }
    })
  }
})