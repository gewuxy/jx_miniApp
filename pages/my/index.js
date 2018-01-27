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
    pageTitle:"",
    isDisabled: true,
    inputNumber:0,
    info:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData);
    //设置不同的页面标题
    if (options.loadPageType == 'editPage') {
      wx.setNavigationBarTitle({ title: '我的信息' });
    } else if (options.loadPageType == 'editPageNickName'){
      wx.setNavigationBarTitle({ title: '昵称' });
    } else if (options.loadPageType == 'editPageInfo') {
      wx.setNavigationBarTitle({ title: '简介' });
    } else if (options.loadPageType == 'helpPage') {
      wx.setNavigationBarTitle({ title: '帮助与反馈' });
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
    //进入页面后加载缓存数据
    that.setData({
      userInfo: wx.getStorageSync('userInfo').userInfo,
      avatar: wx.getStorageSync('avatar'),
      nickName: wx.getStorageSync('nickName'),
      info: wx.getStorageSync('info'),
      inputNumber: wx.getStorageSync('info').length
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
    //分享该页面返回首页
    return {
      path:'/pages/index/index'
    }
  },
  //编辑头像
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
  editAuthority () {
    var that = this;
    wx.openSetting({
      success: (res) => {
        if (!res.authSetting["scope.userInfo"]){
          wx.showModal({
            title: '授权提示',
            content: '小程序功能需要授权才能正常使用噢！请点击“确定”-“用户信息”再次授权',
            success(res){
              that.editAuthority();
            }
          })
        }
      },
      fail: function (res) {
        // 提示版本过低
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    });
  },
  //昵称提交
  nickNameFormSubmit: function (e) {
    var that = this;
    wx.request({
      url: app.host + '/api/user/updateInfo',
      method:'POST',
      data: {
        nickName: e.detail.value["nickName"]
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        //更新缓存
        wx.setStorageSync('nickName', e.detail.value["nickName"]);
        wx.navigateBack();
      }
    })
  },
  infoFormSubmit: function(e) {
    var that = this;
    console.log(e);
    wx.request({
      url: app.host + '/api/user/updateInfo',
      method: 'POST',
      data: {
        info: e.detail.value["info"]
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        //更新缓存
        // wx.setStorageSync('nickName', e.detail.value["nickName"]);
        wx.setStorageSync('info', e.detail.value["info"]);
        wx.navigateBack();
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  bindInput:function(e) {
    var that = this;
    console.log(e);
    //判断是否为空
    e.detail.value != "" ? that.setData({ isDisabled: false }) : that.setData({ isDisabled: true });
    //计算输入数量
    that.setData({ inputNumber:e.detail.cursor });
  },
  getQrcode(){
    wx.request({
      url: app.host + '/api/meeting/mini/qrcode',
      method: 'GET',
      data: {
        id: 1,
        page: '/pages/my/index'
      },
      header: {
        token: wx.getStorageSync('token'),
      },
      success(res) {
        console.log(res);
      }
    })
  },
  //路由
  toEditMy() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=editPage'
    })
  },
  toHelp() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=helpPage'
    })
  },
  toWebUpdateLog() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=toWebUpdateLog'
    })
  },
  toWebService() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=toWebService'
    })
  },
  toWebHelp() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=toWebHelp'
    })
  },
  toWebAbout() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=toWebAbout'
    })
  },
  toHelpUpdateLog() {
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=helpPage'
    })
  },
  toEditMynickName(){
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=editPageNickName'
    })
  },
  toEditMyInfo(){
    wx.navigateTo({
      url: '../../pages/my/index?loadPageType=editPageInfo'
    })
  }
})