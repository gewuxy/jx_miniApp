// pages/meeting/addMeeting.js
const app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs:[],
    token:"",
    imgsFile: [],
    meetingTitle:"",
    popErrorMsg:"",
    courseId:"",
    isEditMeeting:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('跳转到addMeeting', options);
    var that = this;
    var tokenUser = wx.getStorageSync('token');
    if (options.courseId) {
      that.setData({
        courseId: options.courseId,
        isEditMeeting: options.isEditMeeting
      });
    }
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
    console.log('show',that.data.courseId);
    console.log(that.data.isEditMeeting);

    if (that.data.isEditMeeting == 'true' && that.data.courseId != "") {
      console.log('进来了')
      wx.request({
        url: app.host + '/api/meeting/view',
        method: 'GET',
        data: {
          courseId: that.data.courseId
        },
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('show状态', res);
          // console.log(res.data.data.audioCourse.title);
          that.setData({ meetingTitle: res.data.data.audioCourse.title });
        }

      })
    } 

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
      path: '/pages/index/index'
    }
  },
  //递归上传图片函数
  uploadDIY(filePaths,  i, length) {
    var that = this;
    wx.uploadFile({
      url: app.host + '/api/meeting/upload/picture',
      filePath: filePaths[i],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        sort: i,
        courseId: that.data.courseId
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: (resp) => {
        var data = JSON.parse(resp.data);
        data = data.data.id;
        //第一次获取到对应会议的ID
        if( i == 0) {
          that.data.courseId = data
        }
        i++;
        if (i == length) {
          //完成后去到生成会议函数
          that.createMeeting(that.data.courseId);
        } else {
          //递归 将图片传到对应ID里
          that.uploadDIY(filePaths, i, length);
        }
      },
      fail: (res) => {
        console.log(res);
      },
      complete: () => {
        console.log('complete');
      },
    });

    console.log('uploadDIY');
  },
  createMeeting: function (courseId){
    var that = this;
    wx.request({
      url: app.host + '/api/meeting/mini/update',
      method:'POST',
      data:{
        courseId: courseId,
        title: that.data.meetingTitle
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res){
        console.log(res);
        // wx.hideLoading();
        // wx.redirectTo({
        //   url: '../../pages/index/index?isEditComplete=true',
        // })
      }
      
    })
  },
  upLoadMeeting: function (e){
    var that = this;
    var successUp = 0; //成功个数
    var failUp = 0; //失败个数
    var length = that.data.imgs.length; //总共个数
    var i = 0; //第几个
    var tempFilePaths = that.data.imgs  //上传的图片
    console.log(that.data.imgs);
    console.log('token缓存',wx.getStorageSync('token'));

    if (e.detail.value.meetingTitle != "") {
      //设置标题
      that.setData({ meetingTitle: e.detail.value.meetingTitle});
    } else {
      that.setData({ popErrorMsg : '标题不能为空'});
      util.ohShitfadeOut(that);
      return false;
    }
    wx.showLoading({ title: '上传中' });
    if (that.data.isEditMeeting == 'true' && that.data.courseId != "") {
      //判断是编辑状态
      that.createMeeting(that.data.courseId);
      console.log('进来编辑');
    } else {
      that.uploadDIY(tempFilePaths, i, length);
    }
    
    
  }
})