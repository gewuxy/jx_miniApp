// pages/record/index.js
const app = getApp();
var util = require('../../utils/util.js');
const recorderManager = wx.getRecorderManager();    //实例录音
const innerAudioContext = wx.createInnerAudioContext();   //实例音频
var recordTimeInterval, playTimeInterval;
//录音文件默认参数
const recordingOptions = {
  duration: 599999,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 500
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
    isShowTips:true,
    recordState:'default',
    currentRecordArray: [],
    currentRecordTimes: '00:00',
    currentIndex:0,
    currentRecordDurationArray:[],
    recordTime:0,
    isPlayRecord:false,
    finishProgress:0,
    startButtonState:false,  //刚开始的按钮状态
    recordButtonState:false,   //点击录制后按钮状态
    finishButtonState:false,
    playVideo:false,
    currentDetailId:0,
    hasNext:"true"
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
        var videoList = [];
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
          videoList.push(that.data.meetingDetailsList[i].videoUrl);
        }
        that.setData({
          previewImgs: previewList,
          audioList: audioList,
          videoList: videoList,
          isPlayAudio: false,
          isAutoplay: true
        });
        wx.hideLoading();

        //打印缓存数据
        console.log('音频', that.data.audioList);
        console.log('视频', that.data.videoList);
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
    var audioUploadIndex = 0;
    var length = that.data.currentRecordArray.length;
    var tempFilePaths = that.data.currentRecordArray;

    console.log(e);
    //切换还原封面播放图
    that.setData({
      playVideo: false
    })

    console.log(that.data.playVideo);
    
    

    



    //修改标题为页码
    that.setData({  
      changeCurrentIndex: e.detail.current
    });
    wx.setNavigationBarTitle({
      title: (that.data.changeCurrentIndex + 1) + ' / ' + that.data.meetingPages
    });

    

    console.log(that.data.meetingDetailsList[that.data.changeCurrentIndex-1].id);
    console.log(that.data.meetingDetailsList[that.data.changeCurrentIndex - 1].sort);

    that.uploadAudio(tempFilePaths, audioUploadIndex, length, that.data.meetingDetailsList[that.data.changeCurrentIndex - 1].id, that.data.meetingDetailsList[that.data.changeCurrentIndex - 1].sort);


  },
  startRecord: function () {
    console.log('进来了');
    var that = this;
    that.setData({
      recordState:'start'
    });
    recorderManager.start(recordingOptions);
    recorderManager.onStart((res) => {
      console.log('进入录音',res);
      recordTimeInterval = setInterval(function () {
        var recordTime = that.data.recordTime += 1
        that.setData({
          currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),
          recordTime: recordTime
        })
      }, 1000)
    })

    

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
    var currentRecordArray =[];
    
    that.setData({
      recordState: 'default'
    })

    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      // const { tempFilePath } = res
      that.data.currentRecordArray[that.data.currentIndex] = res.tempFilePath;
      that.data.currentRecordDurationArray[that.data.currentIndex] = res.duration;
      that.setData({
        currentRecordArray: that.data.currentRecordArray,
        currentRecordTimes: util.formatTimes(res.duration, 'm:s')
      })
      console.log('临时数字',that.data.currentIndex);
      console.log('录音数组', that.data.currentRecordArray);
      console.log('录音时间', that.data.currentRecordTimes);
      console.log('录音毫秒数组', that.data.currentRecordDurationArray);
      if (that.data.currentRecordDurationArray.length > 1) {
        that.setData({
          currentRecordTimes: util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s'),
          recordTime: util.timeToSec(util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s'))
        })
        console.log('合体毫秒数组', util.arraySum(that.data.currentRecordDurationArray));
        console.log('格式化时间', util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s'));
        console.log('时分转为秒', util.timeToSec(util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s')));

      }

      

      that.setData({
        currentIndex: that.data.currentIndex + 1
      })

      //暂停定时器
      clearInterval(recordTimeInterval)
    })
  },
  playRecord:function() {
    var that = this;
    var playTime = 100 / that.data.recordTime
    var allTime = 0;
    var toPlay = 0;
    var index = 0;

    
    innerAudioContext.src = that.data.currentRecordArray[index];
    innerAudioContext.play();

    //进度条
    playTimeInterval = setInterval(function () {
      console.log('allTime' + allTime);
      allTime = allTime + playTime;
      that.setData({
        finishProgress: allTime
      })
    }, 1000);

    innerAudioContext.onPlay((res) => {


    }),
    innerAudioContext.onCanplay((res) => {
      console.log('进入onCanplay')
    })
    innerAudioContext.onEnded((res) => {
      
      index++;

      // //播放自己的全部录音
      if (index < that.data.currentRecordArray.length) {
        console.log('index', index, '-', that.data.currentRecordArray.length );
        console.log(index);
        innerAudioContext.src = that.data.currentRecordArray[index];
        innerAudioContext.play();
      }
      console.log('endbed', index, '-', that.data.currentRecordArray.length);
      // //如果播放完，改版按钮状态和隐藏进度条
      if (index == that.data.currentRecordArray.length) {
        //暂停定时器
        clearInterval(playTimeInterval);
        console.log('结束了', index, '-', that.data.currentRecordArray.length);
        that.setData({
          isPlayRecord: false
        })

        innerAudioContext.stop();
        index = 0;
      }

      // index += 1;






    })

    that.setData({
      isPlayRecord: !that.data.isPlayRecord
    })
    

  },
  pauseRecord:function(){
    var that = this;
    innerAudioContext.pause();
    that.setData({
      isPlayRecord: !that.data.isPlayRecord
    })
    //暂停定时器
    clearInterval(playTimeInterval)
  },
  playViedoFunction:function (e) {
    var that = this;
    console.log(e);
    var playVideo = wx.createVideoContext(e.currentTarget.dataset.videoid);
    console.log('playVideo',playVideo)
    that.setData({
      playVideo: true
    })
  },
  //视频结束后切换页面
  videoEndChange:function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.currentindex);
    var nextNumber = e.currentTarget.dataset.currentindex + 1
    that.setData({
      changeCurrentIndex: nextNumber
    });
    wx.setNavigationBarTitle({
      title: (nextNumber + 1) + ' / ' + that.data.meetingPages
    });
  },
  uploadAudio(filePaths, i, length, detailId, pageNum) {
    var that = this;
    console.log('filePaths',filePaths);
    console.log('i', i);
    console.log('length', length);
    console.log('detailId', detailId);
    console.log('pageNum', pageNum);
    console.log('hasNext', that.data.hasNext);
    console.log('token', wx.getStorageSync('token'))
    wx.uploadFile({
      url: app.host + '/api/meeting/subsection/upload',
      filePath: filePaths[i],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        courseId: that.data.courseId,
        detailId: detailId,
        pageNum: pageNum,
        audioNum: i,
        hasNext: 'false'
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: (resp) => {
        console.log('服务器返回',resp)
        i++;
        if (i == length) {
          console.log('已经完成',resp);
          //完成后去到生成会议函数
          that.setData({
            hasNext:'false'
          })
          console.log('已经完成', that.data.hasNext);
        } else {
          that.setData({ hasNext: 'false'});

          //递归 将图片传到对应ID里
          that.uploadAudio(filePaths, i, length, detailId, pageNum);
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
})