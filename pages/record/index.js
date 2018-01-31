// pages/record/index.js
const app = getApp();
var util = require('../../utils/util.js');
const recorderManager = wx.getRecorderManager();    //实例录音
const innerAudioContext = wx.createInnerAudioContext();   //实例音频
//录音文件默认参数
const recordingOptions = {
  duration: 599999,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 500,
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadPageType:"",
    meetingDetailsList:[],
    meetingPages:"",
    changeCurrentIndex:0,
    isAutoplay: false,
    isShowTips:false,
    recordState:'default'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
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
        var audioList = [];
        console.log('会议数据', res);
        console.log('会议密码', res.data.data.audioCourse.password);
        console.log('会议详情数据', res.data.data.audioCourse.details);
        console.log('嘿嘿嘿', res.data.data.audioCourse.details[0].imgUrl);

        wx.setNavigationBarTitle({ title: res.data.data.audioCourse.title });

        that.setData({
          meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
          meetingDetailsList: res.data.data.audioCourse.details,
          meetingPassword: res.data.data.audioCourse.password,
          meetingPages: res.data.data.audioCourse.details.length
        });
        //修改标题为页码
        wx.setNavigationBarTitle({ 
          title: (that.data.changeCurrentIndex+1) +' / '+res.data.data.audioCourse.details.length
        });
        //预览图片
        for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
          previewList.push(that.data.meetingDetailsList[i].imgUrl);
          audioList.push(that.data.meetingDetailsList[i].audioUrl);
        }
        that.setData({
          previewImgs: previewList,
          audioList: audioList,
          isPlayAudio: false,
          isAutoplay: true
        });
        wx.hideLoading();

        //打印缓存数据
        console.log('音频', that.data.audioList);
        console.log('预览图', that.data.previewList);
      }
    });
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
  changeSwiper: function (e) {
    var that = this;

    console.log(e);


    //修改标题为页码
    that.setData({  changeCurrentIndex: e.detail.current });
    wx.setNavigationBarTitle({
      title: (that.data.changeCurrentIndex + 1) + ' / ' + that.data.meetingPages
    });


  },
  startRecord: function () {
    console.log('进来了');
    var that = this;
    that.setData({
      recordState:'start'
    });
    recorderManager.start(recordingOptions);
    // var animation = wx.createAnimation({
    //   duration: 1000,
    // })
    // animation.opacity(0).scale(3, 3).step();//修改透明度,放大  
    // that.setData({
    //   spreakingAnimation: animation.export()
    // })
    
  },
  EndRecord:function () {
    console.log('停止了');
    var that = this;
    that.setData({
      recordState: 'default'
    })
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res
    })
  }
})