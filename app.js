//app.js
import url from './utils/url.js'
import util from './utils/util.js'
App({
  onLaunch: function (opts) {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // 登录
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: url.fetchinfo,
          method: "POST",
          data: {
            code: res.code
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success:(res) => {
            var data = res.data,
                status = data.status;
            this.globalData.openid = data.openid;
            data.pinfo && (this.globalData.pInfo = data.pinfo);
            console.log("pInfo:", this.globalData.pInfo)
            wx.request({
              url: url.fetchCarInfo,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              data: {
                openid: data.openid
              },
              success: res => {
                var cInfo = res.data.cinfo
                cInfo && (this.globalData.cInfo = cInfo);
                console.log("app: ", cInfo)
                wx.hideLoading()
                // wx.showToast({
                //   title: '登录成功'
                // })
                if (status === 1) { //aready registered
                  wx.switchTab({
                    url: '/pages/order/order'
                  })
                } 
                // else if (status === 0) {//rediretTo welcome page
                //   wx.redirectTo({
                //     url: '/pages/welcome/welcome'
                //   })
                // } else { //check back-end response
                //   wx.showModal({
                //     title: '警告',
                //     content: 'status ' + status + ' 返回值有误',
                //   })
                // }
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
          },
          fail: (res) => {
            wx.hideLoading();
            wx.showModal({
              title: '警告',
              content: '网络错误，请检查网络设置',
              showCancel: false
            })
          }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getOrderList: function (callback) {
    wx.request({
      url: url.viewOrders,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        openid: this.globalData.openid
      },
      success: res => {
        console.log(res)
        var data = res.data.orders,
          orders = [];
        for (var prop in data) {
          parseInt(prop) && orders.push(data[prop])
        }
        orders.sort((a, b) => {
          return parseInt(b.reserveTime - parseInt(a.reserveTime))
        })
        this.handleList(orders)
        callback(orders);
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          image: '../imags/fail.png',
          duration: 800
        })
      }
    })
  },
  handleList: function (list) {
    list.forEach((order, index) => {
      var currentDate = parseInt(util.getDate().replace(/-/g, '')),
        reserveDate = parseInt(order.reserveDate.replace(/-/g, ''));
      if(currentDate > reserveDate) {
        order.statusCode = 2;
        order.msg = "已过期";
        order.class = "normal";
      } else {
        if(parseInt(order.agreeOrNot) === 0) {
          order.statusCode = 1;
          order.msg = "未审核";
          order.class = "warn";
        } else {
          order.statusCode = 0;
          order.msg = "已审核";
          order.class = "success";
        }
      }
    })
  },
  globalData: {
    openid: '',
    userInfo: null,
    pInfo: null,
    cInfo: null,
    orderList: null
  },
  onshow: options => {
    
  }
})