// pages/meeting/addMeeting.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs:[],
    token:"",
    imgsFile: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('跳转到addMeeting');
    var that = this;
    var tokenUser = wx.getStorageSync('token');
    wx.getStorage({
      key: 'images',
      success: function (res) {
        that.setData({
          imgs: res.data.imgs
        });

        console.log('哇哈哈哈', that.data.imgs);
      },
    });
    console.log(that.data.imgs);
    console.log('tokenIndex', wx.getStorageSync('token'));
    wx.getStorage({
      key: 'token',
      success: function (res) {
        console.log(res.data);
        that.setData({
          token: res.data
        });
        console.log('哇哈哈哈', that.data.imgs);
        console.log('哇哈哈哈1', that.data.token);
      },
    });
    wx.getStorage({
      key: 'imagesFile',
      success: function (res) {
        console.log(res.data.imgs);
        that.setData({
          imgsFile: res.data.imgs
        });
        console.log('呵呵2', that.data.imgsFile[0])
      },
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
  upLoadMeeting: function(e){
    var that = this;
    // wx.request({
    //   url: app.host + '/api/meeting/mini/create/update',
    //   method: 'POST',
    //   data: {
    //     files: that.data.imgsFile[0],
    //     title: 'text'
    //   },
    //   header: {
    //     token: wx.getStorageSync('token')
    //   },
    //   success(res) {
    //     console.log(res);
    //   },
    //   complete: function (res) {

    //   }
    // });
    wx.uploadFile({
      url: app.host + '/api/meeting/mini/create/update',
      filePath: that.data.imgs[0],
      name: 'files',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        'title': 'test'
      },
      header:{
        token: wx.getStorageSync('token')
      },
      success(res) {
        console.log(res);
      }
    })
  }
})