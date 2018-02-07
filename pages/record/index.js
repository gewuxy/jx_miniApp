// pages/record/index.js
const app = getApp();
var util = require('../../utils/util.js');
const recorderManager = wx.getRecorderManager();    //实例录音
const innerAudioContext = wx.createInnerAudioContext();   //实例音频
innerAudioContext.obeyMuteSwitch = false;      //开启静音按钮也能播放声音
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
    meetingPassword:"",
    meetingPages:"",
    ShowTipsText:"",
    changeCurrentIndex:0,
    isAutoplay: false,
    isShowTips:false,
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
    showPlayTime: '00:00',
    endButtonFinishValue:0,
    endButtonLeft: 'start',
    defaultSort:0,
    showEndButton:false,
    durationArray: [],
    endPageTimes:'00:00',    //结束后的总会议时间
    isViedo:false,
    isPassword:"",
    hasUpdateStop:false
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
    wx.showLoading({
      title: '加载中',
      mask:true
    })

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
        var currentTimes = 0
        console.log('会议数据', res);
        console.log('会议密码', res.data.data.audioCourse.password);
        console.log('会议详情数据', res.data.data.audioCourse.details);

        wx.setNavigationBarTitle({ title: res.data.data.audioCourse.title });

        //如果第一页有音频时间
        if (res.data.data.audioCourse.details[that.data.changeCurrentIndex].duration) {
          console.log('没音频');
          currentTimes = res.data.data.audioCourse.details[that.data.changeCurrentIndex].duration
        }

        that.setData({
          meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
          meetingDetailsList: res.data.data.audioCourse.details,
          meetingPassword: res.data.data.audioCourse.password,
          meetingPages: res.data.data.audioCourse.details.length,
          currentAudioDuration: util.formatTime(currentTimes,'m:s')
        });
        if (that.data.loadPageType == "endPage") {
          wx.setNavigationBarTitle({
            title: '完成'
          })
        } else {
          //修改标题为页码
          wx.setNavigationBarTitle({
            title: (that.data.changeCurrentIndex + 1) + ' / ' + res.data.data.audioCourse.details.length
          });
        }
        //判断是不是视频
        if (that.data.meetingDetailsList[that.data.changeCurrentIndex].videoUrl) {
          console.log('有视频的是老大');
          that.setData({
            startButtonState:false,
            recordState:'end',
            isViedo:true,
            currentAudioDuration:0      //将时间设为0
          })
          wx.hideLoading();
        } else {

          if (that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl) {
            console.log('有');
            innerAudioContext.src = res.data.data.audioCourse.details[that.data.changeCurrentIndex].audioUrl
            that.setData({
              startButtonState: true,
              recordState: 'end',
              isViedo: false,
            })
          } else {
            console.log('没');
            that.setData({
              startButtonState: false,
              recordState: 'default',
              ShowTipsText: "每张最长10分钟",
              isShowTips: true,
              isViedo: false,
            })
          }

          //预览图片
          for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
            previewList.push(that.data.meetingDetailsList[i].imgUrl);
            audioList.push(that.data.meetingDetailsList[i].audioUrl);
            videoList.push(that.data.meetingDetailsList[i].videoUrl);
            duration.push(that.data.meetingDetailsList[i].duration);
          }
          //判断所有时长
          var allDuration = res.data.data.duration
          console.log(allDuration);
          if (!allDuration) {
            allDuration = 0
          }

          //判断已经是最后一页
          if (that.data.meetingDetailsList[that.data.changeCurrentIndex].sort == that.data.meetingDetailsList.length) {
            that.setData({
              showEndButton: true
            })
          } else {
            that.setData({
              showEndButton: false
            })
          }


          //设置内容
          that.setData({
            previewImgs: previewList,
            audioList: audioList,
            videoList: videoList,
            durationArray: duration,     //总时长
            endPageTimes: util.formatTime(allDuration, 'm:s'),      //合并后的总时长
            isPlayAudio: false,
            isAutoplay: true,
            isPassword: res.data.data.hasPassword
          });
          wx.hideLoading();


          //打印缓存数据
          // console.log('audioList',that.data);
          console.log('音频', that.data.audioList);
          console.log('视频', that.data.videoList);
          console.log('时长', that.data.durationArray);
          console.log('合并后时长', that.data.endPageTimes);
        // console.log('预览图', that.data.previewList);
        }


      }
    });

    //监控录音开始
    recorderManager.onStart(() => {
      console.log('进入录音');
      //计时开始
      recordTimeInterval = setInterval(function () {
        
        var recordTime = that.data.recordTime += 1
        console.log('有问题吗');
        that.setData({
          currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),
          recordTime: recordTime
        })
        if (that.data.recordTime > 599) {
          console.log('已经够10分钟了');

          that.setData({
            recordState: 'end',
            startButtonState: true,
            recordButtonState: false
          })

          // 需要做提交动作
          recorderManager.stop();
        } else if (that.data.recordTime > 540) {
          that.setData({
            ShowTipsText: "剩余录制时间不足1分钟，注意控制时间",
            isShowTips: true
          })
        } else  if (that.data.recordTime > 480) {
          that.setData({
            ShowTipsText: "剩余录制时间不足2分钟，注意控制时间",
            isShowTips: true
          })
        } 
      }, 1000)
    })
    recorderManager.onError((res) => {
      console.log('录音错误');
      that.setData({
        recordState:'default'
      })
      wx.showModal({
        title: '授权提示',
        content: '小程序功能需要授权才能正常使用噢！请点击“确定”-“录音功能”再次授权',
        showCancel: false,
        success: function(res){
          wx.openSetting({
            success: (res) => {
              that.setData({
                recordState: 'default'
              })
              // if (app.globalData.errorBoll){
              //   console.log('回调');
              //   //回调获取缓存
                
              //   //防止二次加载
              //   app.globalData.errorBoll = true;
              // }
            },
            fail: function(res){
              // 提示版本过低
              wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
              })
            }
          });
        }
      })

    })
    //监控录音停止
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      // const { tempFilePath } = res
      that.data.currentRecordArray[that.data.currentIndex] = res.tempFilePath;
      that.data.currentRecordDurationArray[that.data.currentIndex] = res.duration;
      console.log('暂停之后', res.tempFilePath);
      console.log('暂停之后', that.data.currentIndex);
      console.log('暂停之后', res.duration);
      that.setData({
        currentRecordArray: that.data.currentRecordArray,
        currentRecordTimes: util.formatTimes(res.duration, 'm:s')
      })
      console.log('临时数字', that.data.currentIndex);
      console.log('录音数组', that.data.currentRecordArray);
      console.log('录音时间', that.data.currentRecordTimes);
      console.log('录音毫秒数组', that.data.currentRecordDurationArray);
      if (that.data.currentRecordDurationArray.length > 1) {
        that.setData({
          recordTime: util.timeToSec(util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s')),
          currentRecordTimes: util.formatTimes(util.arraySum(that.data.currentRecordDurationArray), 'm:s')

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

      if (that.data.recordTime > 599) {
        var audioUploadIndex = 0;
        var length = that.data.currentRecordArray.length;
        var tempFilePaths = that.data.currentRecordArray;
        var sort = that.data.meetingDetailsList[that.data.changeCurrentIndex].sort
        var detailId = that.data.meetingDetailsList[that.data.changeCurrentIndex].id

        wx.showLoading({
          title: '上传中',
          mask: true
        })
        //自动长传音频
        that.uploadAudio(tempFilePaths, audioUploadIndex, length, detailId, sort, sort);
      }



    })



  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    console.log('触发隐藏');
    // 切换后停止之前的音乐
    innerAudioContext.stop();
    
    //切换还原封面播放图
    that.setData({
      recordTime: 0,   //如果没有清空显示
      playVideo: false,
      currentIndex: 0,
      showPlayer: false,  //隐藏播放条
      finishProgress: 0,    //播放完成后归零
      playedTime: 0,      //播放完成后归零
      showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
      isPauseState: false,
      isPlayRecord: false,
      currentRecordDurationArray: [],
      currentRecordTimes: util.formatTime(0, 'm:s'),   //如果没有清空显示
      

    })
    //暂停定时器
    clearInterval(playTimeInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 关闭后停止播放声音
    innerAudioContext.stop()
    console.log('录音卸载');
    var that = this;
    var audioUploadIndex = 0;
    var length = that.data.currentRecordArray.length;
    var tempFilePaths = that.data.currentRecordArray;
    var sort = that.data.meetingDetailsList[that.data.changeCurrentIndex].sort
    var detailId = that.data.meetingDetailsList[that.data.changeCurrentIndex].id
    
    wx.showLoading({
      title: '上传中',
      mask: true
    })


    if (that.data.meetingDetailsList[sort - 1].audioUrl) {
      console.log('已有音频');
      // that.setData({ hasUpdateStop: true });
    } else {
      //如果没有任何录音
      console.log('length', length);
      if (length > 0) {
        console.log('有录音')
        that.uploadAudio(tempFilePaths, audioUploadIndex, length, detailId, sort, sort);
      } else {
        console.log('没任何录音，正常切换');
        // that.setData({ hasUpdateStop: true });
      }

    }

    wx.hideLoading();

    //暂停定时器
    clearInterval(recordTimeInterval)

    //跳转刷新
    wx.reLaunch({
      url: '../../pages/index/index?isEditComplete=true',
    })
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
    var that = this;
    if (that.data.isPassword) {
      //分享该页面返回首页
      return {
        title: '你的朋友发来分享',
        path: `/pages/player/index?courseId=${that.data.courseId}&loadPageType=meetingPassword`
      }
    } else {
      //分享该页面返回首页
      return {
        title: '你的朋友发来分享',
        path: `/pages/player/index?courseId=${that.data.courseId}`
      }
    }
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
    console.log('e',e.detail.current);
    

    



    //修改标题为页码
    that.setData({  
      changeCurrentIndex: e.detail.current,
    });
    wx.setNavigationBarTitle({
      title: (that.data.changeCurrentIndex + 1) + ' / ' + that.data.meetingPages
    });

    //判断已经是最后一页
    if (that.data.meetingDetailsList[that.data.changeCurrentIndex].sort == that.data.meetingDetailsList.length) {
      that.setData({
        showEndButton:true
      })
    } else {
      that.setData({
        showEndButton: false
      })
    }
    //判断是否有视频
    if (that.data.meetingDetailsList[that.data.changeCurrentIndex].videoUrl){
      console.log('又是老大');
      that.setData({
        startButtonState: false,
        recordState: 'end',
        isViedo: true,
        currentAudioDuration: 0      //将时间设为0
      })
      //暂停定时器
      clearInterval(playTimeInterval)
    } else {

      //如果已有录音，修改播放时间
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl) {
        innerAudioContext.src = that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl
        that.setData({
          currentAudioDuration: util.formatTime(that.data.meetingDetailsList[that.data.changeCurrentIndex].duration, 'm:s'),
          recordState: 'end',
          startButtonState: true,
          finishProgress: 0,    //播放完成后归零
          playedTime: 0,      //播放完成后归零
          showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
          isPauseState: false,
          isPlayRecord: false,
          ShowTipsText: "",
          isShowTips: false
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
          isPlayRecord: false,
          currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),   //如果没有清空显示
          recordTime: 0,   //如果没有清空显示
          ShowTipsText: "每张最长10分钟",
          isShowTips: true,
          isViedo: false,
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
      if (that.data.meetingDetailsList[sort - 1].duration) {
        console.log('已有音频')
      } else {
        //如果没有任何录音
        console.log('length', length);
        if (length > 0) {
          console.log('有录音')
          that.uploadAudio(tempFilePaths, audioUploadIndex, length, detailId, sort, sort - 1);
        } else {
          console.log('没任何录音，正常切换');
        }

      }
    }




    

  

  },
  //进去录音
  startRecord: function () {
    console.log('进来了');
    var that = this;

    that.setData({
      recordState:'start',
      recordButtonState:true,    //启动录音状态
      currentAudioDuration:0,
      startButtonState:false
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
    var currentRecordArray =[];
    
    that.setData({
      recordState: 'continue',
      isShowTips:true,
      ShowTipsText:'录制已暂停',
      startButtonState:true,
      recordButtonState:false
    })

    recorderManager.stop();

  },
  //播放音频
  playRecord:function() {
    var that = this;
    var playTime = 100 / that.data.recordTime
    var allTime = 0;
    var toPlay = 0;
    var index = 0;

    allTime = that.data.finishProgress

    //如果是暂停状态
    if (that.data.isPauseState){
      // allTime = that.data.finishProgress + playTime
      console.log(allTime);
      //如果有录音
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration) {
        playTime = 100 / that.data.meetingDetailsList[that.data.changeCurrentIndex].duration
        console.log('点击开始进度条', that.data.finishProgress);
        //打开进度条
        that.setData({
          showPlayer: true
        })
      } 

    } else {
      console.log('已有录音', that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl)
      //如果有录音
      if (that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl) {
        //如果音频是有问题
        if (that.data.meetingDetailsList[that.data.changeCurrentIndex].duration){
          innerAudioContext.src = that.data.meetingDetailsList[that.data.changeCurrentIndex].audioUrl;
          playTime = 100 / that.data.meetingDetailsList[that.data.changeCurrentIndex].duration
          //打开进度条
          that.setData({
            showPlayer: true
          })
        } else {
          console.log('当前音频有问题，请重新录制', that.data.changeCurrentIndex);
          wx.showToast({
            title: '当前音频有问题，请重新录制',
            icon: 'none'
          })
          return false;
        }
      } else {
        innerAudioContext.src = that.data.currentRecordArray[index];
        //打开进度条
        that.setData({
          showPlayer: true
        })
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
      console.log('播放错误');
      innerAudioContext.stop;
      //暂停定时器
      clearInterval(playTimeInterval)
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
          showPlayer: false ,     //播放完成后隐藏进度条
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
    playVideo.play();
    that.setData({
      playVideo: true
    })
  },
  //视频结束后切换页面
  videoEndChange:function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.currentindex);
    console.log('结束后视频ID', e.currentTarget.id)
    var nextNumber = e.currentTarget.dataset.currentindex + 1
    that.setData({
      changeCurrentIndex: nextNumber
    });
    wx.setNavigationBarTitle({
      title: (nextNumber + 1) + ' / ' + that.data.meetingPages
    });
  },
  //上传录音递归函数
  uploadAudio(filePaths, i, length, detailId, pageNum, defaultPage) {
    var that = this;

    wx.showLoading({
      title: '上传中',
      mask:true
    })
    if( length == 1) {
      that.setData({
        hasNext:'false'
      })
    }
    console.log('filePathIndex', filePaths[i]);
    console.log('filePath', filePaths);
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
        hasNext: that.data.hasNext
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: (resp) => {
        console.log('服务器返回', resp);
        //如果不等于1
        if (length != 1) {
          i++;
          if ((i+1) > length) {
            var data = JSON.parse(resp.data)
            console.log('c完成了', resp);
            //到最后一个到生成会议函数
            console.log('完成后音频地址', data.data.audioUrl)
            console.log('完成后音频时长', data.data.duration)

            //立即修改页面data数据，已经服务器返回成功
            var currentAudioUrl = "meetingDetailsList[" + defaultPage + "].audioUrl"
            var currentDuration = "meetingDetailsList[" + defaultPage + "].duration"
            console.log('change', currentAudioUrl, '-', that.data.currentAudioUrl)
            console.log('changeAAA', currentDuration, '-', that.data.currentDuration)

            

            that.setData({
              [currentAudioUrl]: data.data.audioUrl,
              [currentDuration]: data.data.duration,
              currentRecordArray: [],     //清空原录音列表
              currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),      //完成后清空录音时间，
              recordTime:0,
              currentIndex: 0,      //每次切换录音数为0
              currentRecordDurationArray:[],   //清空时间列表
              hasNext: 'true',       //每次完成后都需要还原,
              hasUpdateStop: true      //结束后再跳转
            })
            
            if (that.data.endButtonFinishValue == '100') {
              //请求获取最后时长
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
                  console.log('获取总时长', res.data.data.duration);
                  that.setData({
                    endPageTimes: util.formatTime(res.data.data.duration, 'm:s'),
                    loadPageType: 'endPage'
                  })
                }
              })
            }




            wx.hideLoading();


            


          } else if ((i + 1) <= length) {
            length == (i + 1) ? that.setData({ hasNext: 'false' }) : that.setData({ hasNext: 'true' });
            //递归 将图片传到对应ID里
            that.uploadAudio(filePaths, i, length, detailId, pageNum, defaultPage);
            
          } 
        } else {
          console.log('只有一个直接返回', resp)
          var data = JSON.parse(resp.data)
          console.log('完成了', resp);
          //到最后一个到生成会议函数
          console.log('完成后音频地址', data.data.audioUrl)
          console.log('完成后音频时长', data.data.duration)

          //立即修改页面data数据，已经服务器返回成功
          var currentAudioUrl = "meetingDetailsList[" + defaultPage + "].audioUrl"
          var currentDuration = "meetingDetailsList[" + defaultPage + "].duration"
          console.log('change', currentAudioUrl, '-', that.data.currentAudioUrl)
          console.log('change', currentDuration, '-', that.data.currentDuration)



          that.setData({
            [currentAudioUrl]: data.data.audioUrl,
            [currentDuration]: data.data.duration,
            currentRecordArray: [],     //清空原录音列表
            currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),      //完成后清空录音时间，
            recordTime: 0,
            currentIndex: 0,      //每次切换录音数为0
            currentRecordDurationArray:[],   //清空时间列表
            hasNext: 'true'       //每次完成后都需要还原
          })


          if (that.data.endButtonFinishValue == '100') {
            //请求获取最后时长
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
                console.log('获取总时长', res.data.data.duration);
                that.setData({
                  endPageTimes: util.formatTime(res.data.data.duration, 'm:s'),
                  loadPageType: 'endPage'
                })
              }
            })
          }




          wx.hideLoading();
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
  },
  //重新录制
  resetRecord:function(){
    var that = this;
    console.log();
    if (that.data.meetingDetailsList[that.data.meetingDetailsList[that.data.changeCurrentIndex].sort - 1].audioUrl) {
      wx.showModal({
        content: '重录将覆盖原有录音',
        success(res) {
          console.log(wx.getStorageSync('token'));
          if (res.confirm) {
            console.log('重录咯', that.data.meetingDetailsList[that.data.changeCurrentIndex].id);
            wx.request({
              url: app.host + '/api/meeting/delete/audio',
              data: {
                detailId: that.data.meetingDetailsList[that.data.changeCurrentIndex].id
              },
              header: {
                token: wx.getStorageSync('token')
              },
              success(res) {
                //立即修改页面data数据，已经服务器返回成功
                var currentAudioUrl = "meetingDetailsList[" + that.data.changeCurrentIndex + "].audioUrl"
                var currentDuration = "meetingDetailsList[" + that.data.changeCurrentIndex + "].duration"
                console.log()
                that.setData({
                  [currentAudioUrl]: "",
                  [currentDuration]: 0,
                  currentAudioDuration: 0,    //播放时间为0秒
                  recordState: 'default',     //按钮状态为默认
                  startButtonState: false,    //修改按钮状态
                  currentRecordArray: [],     //清空原录音列表
                  currentRecordTimes: util.formatTime(that.data.recordTime, 'm:s'),      //完成后清空录音时间，
                  recordTime: 0,
                  ShowTipsText: "每张最长10分钟",
                  isShowTips: true,
                  showPlayer: false,  //隐藏播放条
                })

                console.log('重录结果', res);
              }
            })
          }
        }
      })
    } else {  //没有音频
      console.log('暂停音乐');


      wx.showModal({
        content: '重录将覆盖原有录音',
        success(res) {
          console.log(wx.getStorageSync('token'));
          if (res.confirm) {
            console.log('清空时间')
            //切换还原封面播放图
            that.setData({
              recordTime: 0,   //如果没有清空显示
              playVideo: false,
              currentIndex: 0,
              showPlayer: false,  //隐藏播放条
              finishProgress: 0,    //播放完成后归零
              playedTime: 0,      //播放完成后归零
              showPlayTime: util.formatTime(that.data.playedTime, 'm:s'),
              isPauseState: false,
              isPlayRecord: false,
              currentRecordDurationArray: [],
              currentRecordTimes: util.formatTime(0, 'm:s'),   //如果没有清空显示
            })
            //暂停定时器
            clearInterval(playTimeInterval)
          }
        }
      })

    }

  },
  //结束拖动按钮
  sliderChange:function(e) {
    var that = this;
    console.log('滑动',e)
    if(e.type == "changing") {
      that.setData({
        endButtonFinishValue:e.detail.value,
        endButtonLeft: false
      })
      
    }
    if (e.type =="change") {
      if (e.detail.value < 70) {
        that.setData({
          endButtonFinishValue: 0,
          endButtonLeft: 'start'
        })
      } else {    //成功后都跳到这个
        that.setData({
          endButtonFinishValue: 100,
          endButtonLeft: 'end',
          // loadPageType:'endPage'
        })

        wx.showModal({
          title: '',
          content: '是否已录制完成全部的演讲内容？',
          showCancel: true,
          success: function(res) {
            console.log(res);
            if(res.confirm) {
                var audioUploadIndex = 0;
                var length = that.data.currentRecordArray.length;
                var tempFilePaths = that.data.currentRecordArray;
                var sort = that.data.meetingDetailsList[that.data.changeCurrentIndex].sort
                var detailId = that.data.meetingDetailsList[that.data.changeCurrentIndex].id
                // 完成后提交最后一页的录音到服务器
                wx.showLoading({
                  title: '上传中',
                  mask:true
                })


                if (that.data.meetingDetailsList[sort-1].audioUrl) {
                  console.log('已有音频');
                  that.setData({ hasUpdateStop: true});
                } else {
                  //如果没有任何录音
                  console.log('length', length);
                  if (length > 0) {
                    console.log('有录音')
                    that.uploadAudio(tempFilePaths, audioUploadIndex, length, detailId, sort, sort);
                  } else {
                    console.log('没任何录音，正常切换');
                    that.setData({ hasUpdateStop: true });
                  }
                  
                }
                
                if (that.data.hasUpdateStop) {
                  //请求获取最后时长
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
                      console.log('获取总时长', res.data.data.duration);
                      that.setData({
                        endPageTimes: util.formatTime(res.data.data.duration, 'm:s'),
                        loadPageType: 'endPage'
                      })
                    }
                  })
                  wx.hideLoading();
                }
                

                
            } else {
              that.setData({
                endButtonFinishValue: 0,
                endButtonLeft: 'start'
              })
            }
          }
        })




        
        
      }
    }
  },
  //去预览画面，能后退
  toMeetingPreview: function () {
    var that = this;
    wx.navigateTo({
      url: `../../pages/player/index?courseId=${that.data.courseId}&recordPage=true`
    });
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
  //生成二维码
  toMettingQRcode: function () {
    var that = this;
    that.hideModal();
    that.setData({ isOpenMore: false });
    wx.navigateTo({
      url: `../../pages/player/index?courseId=${that.data.courseId}&loadPageType=showQRcode`
    });

  },
  //点击放大图片
  showImage: function (e) {
    var that = this;
    console.log('预览e', e);
    console.log(that.data.meetingDetailsList);
    that.setData({
      isOpenMore: false,
      ispreviewImage: true
    });


    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: that.data.previewImgs, // 需要预览的图片http链接列表
      success(res) {
        console.log('success', res);
        innerAudioContext.pause();
        //换图标
        that.setData({
          isPlayAudio: true
        })
      },
      fail(res) {
        console.log('fail', res);
      },
      complete(res) {
        console.log('comlete', res)
      }
    })
  },
  
})