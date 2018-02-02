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
  format: 'aac',
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
    ShowTipsText:"每张最长10分钟",
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
    finishButtonState:false,    //完成后的按钮状态
    audioButtonState:false,
    playVideo:false,      //播放视频
    currentDetailId:0,     
    hasNext:"true",
    currentAudioDuration:0,     //已有音频的事件
    isPauseState:false,    //是否暂停
    playedTime:0,          //已播放时间
    showPlayer:false,       //是否显示播放器
    showPlayTime: '00:00'
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
        var duration = [];
        console.log('会议数据', res);
        console.log('会议密码', res.data.data.audioCourse.password);
        console.log('会议详情数据', res.data.data.audioCourse.details);

        wx.setNavigationBarTitle({ title: res.data.data.audioCourse.title });

        that.setData({
          meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
          meetingDetailsList: res.data.data.audioCourse.details,
          meetingPassword: res.data.data.audioCourse.password,
          meetingPages: res.data.data.audioCourse.details.length,
          currentAudioDuration: util.formatTime(res.data.data.audioCourse.details[that.data.changeCurrentIndex].duration,'m:s')
        });
        //修改标题为页码
        wx.setNavigationBarTitle({ 
          title: (that.data.changeCurrentIndex+1) +' / '+res.data.data.audioCourse.details.length
        });

        if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration){
          console.log('有');
          innerAudioContext.src = res.data.data.audioCourse.details[that.data.changeCurrentIndex].audioUrl
          that.setData({
            startButtonState: true,
            recordState: 'end'
          })
        } else {
          console.log('没');
          that.setData({
            startButtonState: false,
            recordState: 'default'
          })
        }

        //预览图片
        for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
          previewList.push(that.data.meetingDetailsList[i].imgUrl);
          audioList.push(that.data.meetingDetailsList[i].audioUrl);
          videoList.push(that.data.meetingDetailsList[i].videoUrl);
          duration.push(that.data.meetingDetailsList[i].duration);
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
        // console.log('audioList',that.data);
        console.log('音频', that.data.audioList);
        console.log('视频', that.data.videoList);
        // console.log('预览图', that.data.previewList);
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
  //切换完成事件
  changeSwiper: function (e) {
    var that = this;
    var audioUploadIndex = 0;
    var length = that.data.currentRecordArray.length;
    var tempFilePaths = that.data.currentRecordArray;
    var sort = that.data.meetingDetailsList[that.data.changeCurrentIndex].sort
    var detailId = that.data.meetingDetailsList[that.data.changeCurrentIndex].id

    console.log(that.data.meetingDetailsList[that.data.changeCurrentIndex].duration);

    var current = "meetingDetailsList["+that.data.changeCurrentIndex+"].duration"
    console.log('current',current);

    // 切换后停止之前的音乐
    innerAudioContext.stop();
    //切换还原封面播放图
    that.setData({
      playVideo: false,
      showPlayer:false,  //隐藏播放条
    })

    console.log(that.data.playVideo);
    
    

    



    //修改标题为页码
    that.setData({  
      changeCurrentIndex: e.detail.current,
    });
    wx.setNavigationBarTitle({
      title: (that.data.changeCurrentIndex + 1) + ' / ' + that.data.meetingPages
    });
    //如果已有录音，修改播放时间
    if (that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl) {
      innerAudioContext.src = that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl
      that.setData({
        currentAudioDuration: util.formatTime(that.data.meetingDetailsList[that.data.changeCurrentIndex].duration,'m:s'),
        recordState:'end',
        startButtonState: true,
        finishProgress: 0,    //播放完成后归零
        playedTime: 0,      //播放完成后归零
        showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
        isPauseState: false,
        isPlayRecord: false
      })
    } else {
      that.setData({
        currentAudioDuration: 0,
        recordState: 'default',
        startButtonState: false,
        finishProgress: 0,    //播放完成后归零
        playedTime: 0,      //播放完成后归零
        showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
        isPauseState: false,
        isPlayRecord: false
      })
    }
    //暂停定时器
    clearInterval(playTimeInterval)

    // if (that.data.meetingDetailsList[that.data.changeCurrentIndex].sort >)
    console.log('音频的时长', that.data.meetingDetailsList[that.data.changeCurrentIndex].duration);
    console.log('原来页码', sort, '-', '切换后的页码', that.data.meetingDetailsList[that.data.changeCurrentIndex].sort);
    console.log('原来的detailId', detailId, '-', '切换后的Id', that.data.meetingDetailsList[that.data.changeCurrentIndex].id);
    // console.log(that.data.meetingDetailsList[that.data.changeCurrentIndex].id);
    // console.log(that.data.meetingDetailsList[that.data.changeCurrentIndex].sort);
    if (that.data.meetingDetailsList[sort-1].duration) {
      console.log('已有音频')
    } else {
      that.uploadAudio(tempFilePaths, audioUploadIndex, length, detailId, sort);
    }
    


  },
  //进去录音
  startRecord: function () {
    console.log('进来了');
    var that = this;
    that.setData({
      recordState:'start',
      recordButtonState:true    //启动录音状态
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
      recordState: 'default',
      startButtonState:true,
      recordButtonState:false
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
  //播放音频
  playRecord:function() {
    var that = this;
    var playTime = 100 / that.data.recordTime
    var allTime = 0;
    var toPlay = 0;
    var index = 0;

    //打开进度条
    that.setData({
      showPlayer: true
    })

    allTime = that.data.finishProgress

    //如果是暂停状态
    if (that.data.isPauseState){
      // allTime = that.data.finishProgress + playTime
      console.log(allTime);
      //如果有录音
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration) {
        playTime = 100 / that.data.meetingDetailsList[that.data.changeCurrentIndex].duration
        console.log('点击开始进度条', that.data.finishProgress);
      } else {

      }

    } else {

      //如果有录音
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration) {
        innerAudioContext.src = that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl;
        playTime = 100 / that.data.meetingDetailsList[that.data.changeCurrentIndex].duration
      } else {
        innerAudioContext.src = that.data.currentRecordArray[index];

      }

    }


    
    

    //进度条
    playTimeInterval = setInterval(function () {
      console.log('allTime' + allTime);
      console.log('playTime' + playTime);
      console.log('每次时间',that.data.playedTime)
      var playedTimes = that.data.playedTime += 1
      allTime = allTime + playTime;
      that.setData({
        finishProgress: allTime,
        playedTime: playedTimes,
        showPlayTime: util.formatTime(that.data.playedTime, 'm:s')
      })
    }, 1000);
    //执行读条后再执行播放
    innerAudioContext.play();

    

    innerAudioContext.onPlay((res) => {
      console.log(playTime);
      if (playTime == Infinity){
        console.log('报错啦傻叉', res);
      }
    })
    innerAudioContext.onError((res) => {
      
      console.log('开始播放', that.data.meetingDetailsList[that.data.changeCurrentIndex].duration);
      wx.showToast({
        title: '当前音频有问题，请重录',
        icon:'none'
      })
      innerAudioContext.stop;
    })
      
    innerAudioContext.onCanplay((res) => {
      console.log('进入onCanplay', innerAudioContext.duration)
    })
    innerAudioContext.onEnded((res) => {
      //如果有录音
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration) {
        //暂停定时器
        clearInterval(playTimeInterval);
        console.log('结束了', index, '-', that.data.currentRecordArray.length);
        that.setData({
          isPlayRecord: false,
          finishProgress: 0,    //播放完成后归零
          playedTime: 0,      //播放完成后归零
          showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
          showPlayer: false      //播放完成后隐藏进度条
        })

        innerAudioContext.stop();
      } else {
        index++;

        // //播放自己的全部录音
        if (index < that.data.currentRecordArray.length) {
          console.log('index', index, '-', that.data.currentRecordArray.length);
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
            isPlayRecord: false,
            isPauseState: false,
            finishProgress: 0,    //播放完成后归零
            playedTime: 0,        //播放完成后归零
            showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
            showPlayer: false      //播放完成后隐藏进度条
          })

          innerAudioContext.stop();
          index = 0;
        }

      }
      

      // index += 1;






    })

    that.setData({
      isPlayRecord: !that.data.isPlayRecord
    })
    

  },
  //暂停音频
  pauseRecord:function(){
    var that = this;
    that.setData({
      isPlayRecord: !that.data.isPlayRecord,
      isPauseState: true
    })
    //暂停定时器
    clearInterval(playTimeInterval)
    innerAudioContext.pause();
    console.log('点击结束进度条', that.data.finishProgress);
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
  //切换动画状态监听
  bindanimationfinishButton :function(e){
    console.log(e);
  },
  //启动录音后阻挡层事件
  stopChange: function(){
    var that = this;
    // wx.showLoading({
    //   title: '请录制完成当前页面后再切换'
    // })
    wx.showToast({
      title: '请录制完成当前页面后再切换',
      icon:'none'
    })
    // that.setData({
    //   ShowTipsText:'请录制完成当前页面后再切换'
    // })
  }
})