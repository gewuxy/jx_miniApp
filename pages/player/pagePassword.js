const app = getApp();
var util = require('../../utils/util.js');
// pages/player/pagePassword.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    randomNum:"",
    isDisabled: true,
    loadPageType:"",
    courseId:"",
    meetingPassword:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    that.setData({
      courseId: options.courseId,
      loadPageType: options.loadPageType,
      meetingPassword: options.meetingPassword
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.reLaunch({
      url: '../../pages/index/index?isEditComplete=true',
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    //分享该页面返回首页
    return {
      path: '/pages/index/index'
    }
  },
  randomNum: function(e) {
    var that = this;
    var num = "";
    for (var i = 0; i < 4; i++) {
      num += Math.floor(Math.random() * 10)
    }
    that.setData({ randomNum: num });
    //判断是否为空
    e.detail.value != "" ? that.setData({ isDisabled: false }) : that.setData({ isDisabled: true });
  },
  bindInput: function (e) {
    var that = this;
    console.log(e);
    //判断是否为空
    e.detail.value.length == 4 ? that.setData({ isDisabled: false }) : that.setData({ isDisabled: true });
  },
  //提交密码
  setPasswordFormSubmit: function(e) {
    var that = this;
    console.log(e.detail.value.meetingPassword);
    wx.request({
      url: app.host + '/api/meeting/set/password',
      method: 'POST',
      data: {
        id: that.data.courseId,
        type:1,
        password: e.detail.value.meetingPassword
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        console.log('是否成功', res);
        wx.hideLoading();
        wx.reLaunch({
          url: '../../pages/index/index?isEditComplete=true',
        })
      }

    })
  },
  //删除密码
  removePasswordFormSubmit: function(e) {
    var that = this;
    wx.request({
      url: app.host + '/api/meeting/set/password',
      method: 'POST',
      data: {
        id: that.data.courseId,
        type: 2
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        console.log('是否成功', res);
        wx.hideLoading();
        that.setData({ loadPageType:'setMeetingPassword'});
      }
    })
  }
})