//Warning: openid in globalData may be undefined when the network quality is low
//Please use callback mode when using async request 
import url from '../../utils/url.js'
var registerType = '',
    app = getApp(),
    openid = '',
    photoName = '',// file name of the photo
    validators =  {
      userName: function (value) {
        value = value.trim();
        if(value === '') {
          return '姓名不能为空'
        }
        return ''
      },
      idcardNumber: function (value) {
        var idNumber = value.trim(),
            check = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
          ratio = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2"],
            frontNumber = idNumber.slice(0, -1).split(''),
            sum = 0,
            checkBit = '';
        if(idNumber.length === 0) {
          return '请填写身份证号'
        }
        if(idNumber.length === 18) {
          for(var i = 0; i < 17; i ++) {
            sum += parseInt(frontNumber[i]) * parseInt(ratio[i]);
          }
          checkBit = check[sum % 11];
          if(checkBit === idNumber.slice(-1)) {
            return ''
          }
        }
        return '身份证号不正确'
      },
      phoneNumber: function (value) {
        var checkReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        value = value.trim();
        if(value.length === 0) {
          return '请填写手机号码'
        }
        if(checkReg.test(value)) {
          return ''
        } else {
          return '手机号码不正确'
        }
      },
      photo: function (value) {
        if(value.length === 0) {
          return '请选择图片'
        }
        return '';
      }
    }
Page({
  onLoad: function (option) {
    openid = app.globalData.openid
    registerType = option.type
    this.setData({
      registerType
    })
    registerType === 'idcard' && wx.chooseImage({
      count: 1,
      success: (res) => {
        var path = res.tempFilePaths[0]
        wx.showLoading({
          title: '识别中',
          mask: true
        });
        wx.uploadFile({
          url: url.idOCR,
          filePath: path,
          name: 'file',
          header: {
            "Content-Type": 'multipart/form-data'
          },
          formData: {
            openid: openid
          },
          success: res => {
            var data = res.data && typeof res.data === 'string' ?
             JSON.parse(res.data.replace(/^.*(?={)/, '')) :
              res.data
            console.log("id data", data)
            wx.hideLoading()
            if(data && data.ID) {
              wx.showToast({
                title: '识别成功',
                duration: 800
              })
              this.genderChange({ detail: { value: data.sex } })
              this.setData({
                phoneFocus: true, 
                nameFocus: false,
                idcardNumber: data.ID,
                userName: data.name
              })
              photoName = data.photo
              wx.downloadFile({
                url: url.preview + "?filename=" + photoName,
                success: res => {
                  this.setData({
                    photo: res.tempFilePath
                  })
                },
                fail: () => {
                  wx.showToast({
                    title: '网络错误',
                    image: '../images/fail.png',
                    duration: 800
                  })
                }
              })
            } else {
              wx.showToast({
                title: '识别失败',
                image: '../images/fail.png',
                duration: 1000
              })
              this.setData({
                nameFocus: true,
                registerType: 'normal'
              })
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({
              title: '上传失败',
              image: '../images/fail.png',
              duration: 1000
            })
            this.setData({
              nameFocus: true,
              phoneFocus: false,
              registerType: 'normal'
            })
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '已取消',
          image: '../images/fail.png',
          duration: 500
        })
        this.setData({
          nameFocus: true,
          phoneFocus: false,
          registerType: 'normal'
        })
      }
    })
    registerType === 'normal' && this.setData({
      nameFocus: true,
      phoneFocus: false
    })
  },
  data: {
    showTopTips: false,
    errMsg: '',
    userName: "",
    idcardNumber: "",
    phoneNumber: "",
    photo: "", //photo file
    registerType: "",
    genders: [
      { name: '男', value: 'M', checked: false },
      { name: '女', value: 'F', checked: true }
    ],
    phoneFocus: false,
    nameFocus: false
  },
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  genderChange: function (e) {
    var genders = this.data.genders;
    for (var i = 0, len = genders.length; i < len; ++i) {
      genders[i].checked = genders[i].value == e.detail.value;
    }
    this.setData({
      genders: genders
    });
  },
  inputChange: function (e) {
    var target = e.target.id,
        value = e.detail.value,
        freshObj = {}
    freshObj[target] = value
    this.setData(freshObj)
  },
  inputBlur: function (e) {

  },
  changeImage: function () {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        var photo = res.tempFilePaths[0];
        wx.showLoading({
          title: '处理中',
          mask: true
        })
        wx.uploadFile({
          url: url.uploadImage,
          filePath: photo,
          name: 'file',
          formData: {
            openid: openid
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success: (res) => {
            wx.hideLoading();
            if(res.data.msg === 'success') {
              photoName = res.data.photo
              this.setData({
                photo
              })
            } else {
              wx.showToast({
                title: '非法照片',
                image: '../images/fail.png',
                duration: 1000
              })
              this.setData({
                photo: ''
              })
            }
          },
          fail: (res) => {
            wx.hideLoading()
            wx.showToast({
              title: '网络错误',
              image: '../images/fail.png',
              duration: 1000
            })
          }
        })
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      urls: [this.data.photo],
    })
  },
  submitInfo: function () {
    var msgObj = {
      userName: this.data.userName,
      idcardNumber: this.data.idcardNumber,
      phoneNumber: this.data.phoneNumber,
      photo: photoName
    },
    gender = '',
    genders = this.data.genders,
    validator = null,
    validateMsg = '';
    for(var i = 0; i < 2; i ++) {
      if(genders[i].checked === true) {
        gender = genders[i].value;
      }
    }
    for(var item in msgObj) {
      validator = validators[item]
      validateMsg = validator(msgObj[item])
      if(validateMsg !== '') {
        this.showTips(validateMsg)
        return '';
      }
    }
    console.log({
      ID: msgObj.idcardNumber,
      Name: msgObj.userName,
      telephone: msgObj.phoneNumber,
      Sex: gender,
      openid: openid,
      photo: photoName
    })
    wx.showLoading({
      title: '上传中',
      mask: true
    })
    wx.request({
      url: url.addInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        ID: msgObj.idcardNumber,
        Name: msgObj.userName,
        telephone: msgObj.phoneNumber,
        Sex: gender,
        openid: openid,
        photo: photoName
      },
      success: (res) => {
        console.log(res.data)
        wx.hideLoading();
        if(!res.data) {
          wx.showToast({
            title: '提交失败',
            image: '../images/fail.png',
            duration: 800,
          })
        } else if (res.data.ID !== 0) {
          this.showTips("身份证号不正确")
        } else if (res.data.telephone !== 0) {
          tihs.showTips("手机号不正确")
        } else {
          wx.showToast({
            title: '提交成功',
            duration: 800,
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../order/order'
            })
          }, 800)
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          image: '../images/fail.png',
          duration: 1000
        })
      }
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
  }
});