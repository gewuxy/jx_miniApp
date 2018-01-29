const app = getApp();
var util = require('../../utils/util.js');
// pages/player/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadPageType: "",
    courseId: "",
    QRcode:"",
    userInfo:{},
    meetingavatar:"",
    popErrorMsg:"",
    isOpenMore:false,
    imgs: [],
    meetingDetailsList:[],
    changeCurrentIndex:0,
    previewImgs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    if (options.loadPageType == 'showQRcode') {
      that.setData({
        popErrorMsg:'截图保存，分享到朋友圈'
      });
    }
    that.setData({
      courseId: options.courseId,
      loadPageType: options.loadPageType,
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
    var userStorageInfoUser = wx.getStorageSync('userInfo');
    var userStorageToken = wx.getStorageSync('token');

    //已有Token缓存
    if (userStorageToken && userStorageInfoUser) {
      userStorageInfoUser = userStorageInfoUser.userInfo
      //设置数据
      this.setData({
        userInfo: userStorageInfoUser
      });
      wx.showLoading({  title: '生成中' });
      //加载二维码
      wx.request({
        url: app.host + '/api/meeting/mini/qrcode',
        method: 'GET',
        data: {
          id: that.data.courseId,
          page: '/pages/player/index'
        },
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('二维码成功', res.data.data);
          that.setData({
            QRcode: res.data.data
          });
          wx.hideLoading();
          util.ohShitfadeOut(that);
        }
      });
      //加载会议数据
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
          var previewList = [];
          console.log('会议数据',res);
          console.log('会议密码',res.data.data.audioCourse.password);
          console.log('会议详情数据', res.data.data.audioCourse.details);


          that.setData({
            meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
            meetingDetailsList: res.data.data.audioCourse.details
          });
          //预览图片
          for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
            previewList.push(that.data.meetingDetailsList[i].imgUrl);
            console.log(that.data.meetingDetailsList[i].imgUrl);
          }
          that.setData({ previewImgs: previewList});
          console.log('预览图片', that.data.previewImgs);
          console.log(res.data.data.audioCourse.details);
        }
      });

      
      //打印缓存数据
      console.log(that.data.userInfo);



    } else {
      wx.showLoading({ title: '加载中' });
      //第一次访问
      app.getUserInfo().then(function (res) {
        console.log('访问前', res);
        if (res.status == 200) {
          //获取会员信息
          that.setData({
            userInfo:res.userInfo
          });
          //加载二维码
          wx.request({
            url: app.host + '/api/meeting/mini/qrcode',
            method: 'GET',
            data: {
              id: that.data.courseId,
              page: '/pages/player/index'
            },
            header: {
              token: wx.getStorageSync('token')
            },
            success(res) {
              console.log('二维码成功', res);
              that.setData({
                QRcode: res.data.data
              })
            }
          });
          //加载会议数据
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
              var previewList = [];
              console.log('会议数据',res);
              console.log('会议密码',res.data.data.audioCourse.password);
              that.setData({
                meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
                meetingDetailsList: res.data.data.audioCourse.details
              });
              //预览图片
              for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
                previewList.push(that.data.meetingDetailsList[i].imgUrl);
                console.log(that.data.meetingDetailsList[i].imgUrl);
              }
              that.setData({ previewImgs: previewList });
            }
          });


          console.log('第一次加载',that.data.userInfo);
        } else {
          console.log(res.data);
        }
      });
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
  
  },
  openMoreButton: function() {
    var that = this;
    that.setData({
      isOpenMore: !that.data.isOpenMore
    })
    console.log(that.data.isOpenMore);
  },
  //显示自定义弹窗
  showModal: function (e) {
    var that = this;
    console.log(e);
    that.setData({ 
      isOpenMore: false,
      popupType: 'sharePopup'
    });
    util.showModal(that);
  },
  //隐藏自定义弹窗
  hideModal: function () {
    var that = this;
    util.hideModal(that);
  },
  //显示举报弹出层
  showReportModal: function(e) {
    var that = this;
    console.log(e);
    that.setData({ 
      isOpenMore: false,
      popupType: 'reportPopup'
    });
    util.showModal(that);
  },
  //生成二维码
  toMettingQRcode: function () {
    var that = this;
    that.hideModal();
    that.setData({  isOpenMore: false });
    wx.navigateTo({
      url: `../../pages/player/index?courseId=${that.data.courseId}&loadPageType=showQRcode`
    });

  },
  //举报按钮
  postReport:function(e) {
    var that = this;
    console.log('举报',e.currentTarget.dataset.reporttype);
    that.hideModal();
    wx.request({
      url: app.host + '/api/meeting/report',
      method: 'POST',
      data: {
        courseId: that.data.courseId,
        type: e.currentTarget.dataset.reporttype
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        wx.showToast({
          title: '举报成功',
          icon: 'success'
        });
      }

    })
  },
  //上传图片并跳转
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    //清空已经选中的图片
    that.setData({ imgs: [] });

    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function () {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      return false;
    }
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 9) {
            that.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        //缓存数据
        wx.setStorage({
          key: 'images',
          data: {
            imgs: that.data.imgs
          },
          success: function (res) {
            console.log("存储成功");
          }
        });
        //跳转到新增图片页面
        wx.navigateTo({
          url: '../../pages/meeting/addPhoto'
        });
      }
    });
  },
  //获得当前页位标
  changeSwiper: function (e) {
    console.log(e);
    this.setData({
      changeCurrentIndex: e.detail.current
    });
  },
  showImage: function (e) {
    var that = this;
    console.log('预览e',e);
    console.log(that.data.meetingDetailsList);

    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: that.data.previewImgs // 需要预览的图片http链接列表
    })
  },
  
})