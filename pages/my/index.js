// pages/my/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:[],
    avatar:"",
    nickName:"",
    loadPageType:"",
    pageTitle:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('每个的页码', options.loadPageType)
    console.log(app.globalData);
    if (options.loadPageType == 'editPage') {
      wx.setNavigationBarTitle({ title: '我的信息' });
    }
    var that = this;
    that.setData({
      loadPageType: options.loadPageType
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
    var that = this;
    that.setData({
      userInfo: wx.getStorageSync('userInfo').userInfo,
      avatar: wx.getStorageSync('avatar'),
      nickName: wx.getStorageSync('nickName')
    });
    console.log('userInfo', that.data.userInfo);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
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
  
  },
  editAvatar() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log('tempFilePaths',tempFilePaths);
        wx.uploadFile({
          url: app.host + '/api/user/updateAvatar',
          filePath: tempFilePaths[0],
          name: 'file',
          header: { "Content-Type": "multipart/form-data" },
          header: {
            token: wx.getStorageSync('token')
          },
          success(res) {
            var data = JSON.parse(res.data);
            //更新页面
            that.setData({
              avatar: data.data.url
            });
            //更新缓存
            wx.setStorageSync('avatar', data.data.url);
          }
        })
      }
    });
  },
  //路由
  toEditMy() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=editPage'
    })
  },
  toHelp() {
    wx.navigateTo({
      url: '../../pages/my/help'
    })
  }
})