//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //下拉刷新
  onPullDownRefresh: function(){
    wx.request({
      url: '',
      data: {},
      method: 'GET',
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {
        wx.stopPullDownRefresh();
      }
    })
  },
  //分享按钮
  onShareAppMessage: function (options){
    console.log(1);
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  bindAction: function () {
    console.log('进入登录事件');
    wx.login({
      success: (res) => {
        console.log('首次登录',res);
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code',
            data: {
              code: res.code
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
        wx.hideLoading();
        wx.getUserInfo({
          withCredentials: false,
          success: (res) => {
            console.log(res);
            this.setData({
              userInfo: {
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName
              },
              bType: "warn",
              actionText: "退出登录"
            });
            // 存储用户信息到本地
            wx.setStorage({
              key: 'userInfo',
              data: {
                userInfo: {
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName
                },
                bType: "warn",
                actionText: "退出登录"
              },
              success: function (res) {
                console.log("存储成功")
              }
            })
          }
        })
      }
    })
  },
  getUserInfo: function(e) {
    // console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
