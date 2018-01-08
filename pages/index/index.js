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
  onLoad: function (options) {
    
  }
})
