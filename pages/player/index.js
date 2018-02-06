const app = getApp();
var util = require('../../utils/util.js');
const innerAudioContext = wx.createInnerAudioContext();   //实例音频
innerAudioContext.obeyMuteSwitch = false;      //开启静音按钮也能播放声音
var playVideo;    //视频实例



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
    previewImgs: [],
    isDisabled:true,
    meetingPassword:"",
    QRpage:"",
    audioList:[],
    videoList:[],
    isPlayAudio:true,     //按钮状态
    isAutoplay:false,      //是否自动切换
    ispreviewImage:false,
    currentAudio:"",
    isVideo:false,
    isAudio:false,
    playVideo:false,
    videoBgcolor:"",
    isTruePassword:false,      //密码是否正确
    isPassword:false,          //是否有密码
    isRecordPage:false,
    activityType:'',    //活动按钮
    radioCheckVal:0,
    radioIsDisabled:true,
    redPackList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var optionsA = decodeURIComponent(options.scene)
    var optionsB = optionsA.split('&')
    var that = this;
    //如果是二维码进来的
    if (options.scene) {
      options.courseId = optionsB[0]
      if (optionsB[1]) {
        options.loadPageType = 'meetingPassword'
      }
    } 
    console.log('到页面接收', options);
    console.log('页面接收转换', optionsB);
    console.log(options);
    if (options.loadPageType == 'showQRcode') {
      that.setData({
        popErrorMsg:'截图保存，分享到朋友圈'
      });
    } else if (options.loadPageType == 'meetingPassword') {
      wx.setNavigationBarTitle({ title: '观看密码' });
    }

    if (options.activityType == 'redPack') {
      that.setData({
        activityType: 'redPack'
      })
    }



    that.setData({
      courseId: options.courseId,
      loadPageType: options.loadPageType,
      isRecordPage: options.recordPage
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

    //解决官方图册打开后触发onShow的BUG问题
    if (that.data.ispreviewImage) {
      that.setData({ 
        ispreviewImage:false,
       })
    } else {
    //解决官方图册打开后触发onShow的BUG问题


      //已有Token缓存
      if (userStorageToken && userStorageInfoUser) {

        userStorageInfoUser = userStorageInfoUser.userInfo
        //设置数据
        this.setData({
          userInfo: userStorageInfoUser
        });
        //生成二维码
        if (that.data.loadPageType == 'showQRcode') {

          wx.showLoading({ title: '生成中' ,mask:true});


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
              var QRpageRes = ""
              that.setData({
                meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
                meetingPassword: res.data.data.audioCourse.password
              });
              wx.setNavigationBarTitle({ title: res.data.data.audioCourse.title });
              if (that.data.meetingPassword) {
                QRpageRes = '/pages/player/index' + '?' + that.data.courseId + '&FPS'
                that.setData({
                  QRpage: QRpageRes
                })
              } else {
                QRpageRes = '/pages/player/index' + '?' + that.data.courseId
                that.setData({
                  QRpage: QRpageRes
                })
                console.log('没密码', QRpageRes);
              }
              console.log('拿页面数据', that.data);



              //加载二维码
              wx.request({
                url: app.host + '/api/meeting/mini/qrcode',
                method: 'GET',
                data: {
                  id: that.data.courseId,
                  page: that.data.QRpage
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




            }
          });






        } else {
          wx.showLoading({ 
            title: '加载中',
            mask: true 
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
              var audioList = [];
              var videoList = [];
              var thisIsAutoPlay;
              var thatIsPassword;
              console.log('会议数据', res);
              console.log('会议密码', res.data.data.audioCourse.password);
              console.log('会议详情数据', res.data.data.audioCourse.details);
              console.log('嘿嘿嘿', res.data.data.audioCourse.details[0].imgUrl);

              wx.setNavigationBarTitle({ title: res.data.data.audioCourse.title });

              

              that.setData({
                meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
                meetingDetailsList: res.data.data.audioCourse.details,
                meetingPassword: res.data.data.audioCourse.password
              });
              //预览图片
              for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
                previewList.push(that.data.meetingDetailsList[i].imgUrl);
                audioList.push(that.data.meetingDetailsList[i].audioUrl);
                videoList.push(that.data.meetingDetailsList[i].videoUrl);
              }
              //判断是否有密码
              if (!res.data.data.hasPassword || that.data.isRecordPage) {
                console.log('onshow是有密码的');
                //如果第一个是视频，就不自动播放
                if (that.data.meetingDetailsList[0].videoUrl) {
                  console.log('是老大');
                  //自动播放第一个视频
                  that.playAutoState('videoSwiper-0');

                  that.setData({
                    isPlayAudio: false
                  })
                  
                  thisIsAutoPlay = false;
                } else if (that.data.meetingDetailsList[0].audioUrl) {
                  console.log('onshow有音频')
                  thisIsAutoPlay = false;
                  innerAudioContext.src = that.data.meetingDetailsList[0].audioUrl
                  innerAudioContext.play();
                  that.setData({
                    isPlayAudio: true
                  })
                } else {
                  thisIsAutoPlay = true;
                  that.setData({
                    isPlayAudio: true
                  })
                }
              } else {
                that.setData({
                  isPassword:res.data.data.hasPassword,
                })
              }


              that.setData({
                previewImgs: previewList,
                audioList: audioList,
                videoList: videoList,
                
                isAutoplay: thisIsAutoPlay      //自动切换
              });
              wx.hideLoading();

              //打印缓存数据
              console.log('音频', that.data.audioList);
              console.log('视频', that.data.videoList)
              console.log('预览图', that.data.previewList);
            }
          });
        }

      } else {
        wx.showLoading({ 
          title: '加载中',
          mask: true 
        });
        //第一次访问
        app.getUserInfo().then(function (res) {
          console.log('访问前', res);
          if (res.status == 200) {
            //获取会员信息
            that.setData({
              userInfo: res.userInfo
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
                var audioList = [];
                var videoList = [];
                var thisIsAutoPlay;
                var thatIsPassword;
                console.log('会议数据', res);
                console.log('会议密码', res.data.data.audioCourse.password);
                that.setData({
                  meetingavatar: res.data.data.audioCourse.details[0].imgUrl,
                  meetingDetailsList: res.data.data.audioCourse.details
                });
                //预览图片
                for (var i = 0; i < that.data.meetingDetailsList.length; i++) {
                  previewList.push(that.data.meetingDetailsList[i].imgUrl);
                  audioList.push(that.data.meetingDetailsList[i].audioUrl);
                  videoList.push(that.data.meetingDetailsList[i].videoUrl);
                  
                }
                //判断是否有密码
                if (!res.data.data.hasPassword || that.data.isRecordPage) {
                  console.log('onshow是有密码的');
                  //如果第一个是视频，就不自动播放
                  if (that.data.meetingDetailsList[0].videoUrl) {
                    console.log('是老大');
                    //自动播放第一个视频
                    that.playAutoState('videoSwiper-0');

                    that.setData({
                      isPlayAudio: false
                    })

                    thisIsAutoPlay = false;
                  } else if (that.data.meetingDetailsList[0].audioUrl) {
                    console.log('onshow有音频')
                    thisIsAutoPlay = false;
                    innerAudioContext.src = that.data.meetingDetailsList[0].audioUrl
                    innerAudioContext.play();
                    that.setData({
                      isPlayAudio: true
                    })
                  } else {
                    thisIsAutoPlay = true;
                    that.setData({
                      isPlayAudio: true
                    })
                  }
                } else {
                  that.setData({
                    isPassword: res.data.data.hasPassword,
                  })
                }



                
                that.setData({ 
                  previewImgs: previewList,
                  audioList: audioList,
                  videoList: videoList,
                  isAutoplay: thisIsAutoPlay      //自动切换
                });
                wx.hideLoading();

                //打印缓存数据
                console.log('音频', that.data.audioList);
                console.log('视频', that.data.videoList)
                console.log('预览图', that.data.previewList);

              }
            });


            console.log('第一次加载', that.data.userInfo);
          } else {
            console.log(res.data);
          }
        });
      }



    }




    //监控音频播放器
    innerAudioContext.onPlay(() => {
      console.log('开始播放');
      that.setData({ isPlayAudio: false });
    });
    innerAudioContext.onEnded(() => {
      console.log('结束播放');
      //判断是最后一页，不再自动切换
      if (that.data.changeCurrentIndex + 1 == that.data.meetingDetailsList.length){
        that.setData({ isPlayAudio: false });
      } else {
        that.setData({ isAutoplay: true });
      }
      
    });

    





  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    console.log('切出去了')
    that.setData({
      isAutoplay: false
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    innerAudioContext.stop();
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
    if (that.data.isPassword){
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
  
  //点击放大图片
  showImage: function (e) {
    var that = this;
    console.log('预览e',e);
    console.log(that.data.meetingDetailsList);
    that.setData({ 
      isOpenMore: false,
      ispreviewImage:true
    });
    

    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: that.data.previewImgs, // 需要预览的图片http链接列表
      success (res) {
        console.log('success',res);
        innerAudioContext.pause();
        //换图标
        that.setData({
          isPlayAudio: true
        })
      },
      fail (res) {
        console.log('fail', res);
      },
      complete(res) {
        console.log('comlete',res)
      }
    })
  },
  //监控输入框
  bindInput: function (e) {
    var that = this;
    console.log(e);
    //判断是否为空
    e.detail.value.length == 4 ? that.setData({ isDisabled: false }) : that.setData({ isDisabled: true });
  },
  //提交密码
  meetingPasswordFormSubmit:function(e) {
    var that = this;
    var thisIsAutoPlay;
    if (e.detail.value.meetingPassword == that.data.meetingPassword) {

      //如果第一个是视频，就不自动播放
      if (that.data.meetingDetailsList[0].videoUrl) {
        thisIsAutoPlay = false;
      } else if (that.data.meetingDetailsList[0].audioUrl) {
        console.log('onshow有音频')
        thisIsAutoPlay = false;
        innerAudioContext.src = that.data.meetingDetailsList[0].audioUrl
        innerAudioContext.play();
      } else {
        thisIsAutoPlay = true;
      }

      that.setData({
        loadPageType:"",
        isTruePassword:true,
        isPlayAudio: false,
        isAutoplay: thisIsAutoPlay      //自动切换
      })
    } else {
      that.setData({ popErrorMsg:'密码错误' });
      util.ohShitfadeOut(that);
    }
  },
  //切换PPT
  changeSwiper: function (e) {
    var that= this;
    //切换暂停
    innerAudioContext.stop();
    e.detail.source = "";
    that.setData({
      playVideo: false,
      videoBgcolor: ""
    })

    console.log('切换ppt',e);
    console.log(that.data.audioList[e.detail.current]);
    if (that.data.videoList[e.detail.current]) {
      console.log('老大的滋味');
      that.setData({
        isAutoplay: false,
        isPlayAudio: true
      });
    } else {
      //切换播放录音
      if (that.data.audioList[e.detail.current]) {
        that.setData({
          isAutoplay: false,
          currentAudio: that.data.audioList[e.detail.current]
        });
        innerAudioContext.src = that.data.currentAudio;
        innerAudioContext.play();
      } else {
        that.setData({
          isAutoplay: true
        })
      }

    }


    //修改页码
    that.setData({
      changeCurrentIndex: e.detail.current
    });

  },
  //自动播放
  playAutoState:function(viedoId) {
    var that = this;
    console.log('播放视频', viedoId);
    playVideo = wx.createVideoContext(viedoId);
    console.log('playVideo', playVideo)
    that.setData({
      playVideo: true,
      videoBgcolor: '#000',
      enableProgress: false
    })
    playVideo.play();
    
  },
  //开始暂停按钮
  playState:function(e) {
    var that = this;
    console.log(that.data.changeCurrentIndex);
    console.log(e);

    //判断是视频
    if (that.data.videoList[that.data.changeCurrentIndex]) {
      console.log('老大');
      
      //换图标
      if (that.data.isPlayAudio) {
        //图标播放状态，音频没播
        playVideo.play();
      } else {
        //图标暂停状态,音频在播
        playVideo.pause();
      }
    } else if (that.data.audioList[that.data.changeCurrentIndex]) {
      console.log('有语音')
      //换图标
      if (that.data.isPlayAudio) {
        //图标播放状态，音频没播
        innerAudioContext.play();
      } else {
        //图标暂停状态,音频在播
        innerAudioContext.pause();
      }
    } else {
      console.log('图片');
      that.setData({
        isAutoplay: !that.data.isAutoplay
      })
    }
    

    that.setData({
      isPlayAudio: !that.data.isPlayAudio,
      
    })
   
      

  },
  //播放视频
  playViedoFunction: function (e) {
    var that = this;
    console.log('播放视频',e);
    playVideo = wx.createVideoContext(e.currentTarget.dataset.videoid);
    console.log('playVideo', playVideo)
    that.setData({
      playVideo: true,
      videoBgcolor: '#000',
      enableProgress:false
    })
    playVideo.play();
  },
  //视频结束后切换页面
  videoEndChange: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.currentindex);
    console.log('结束后视频ID', e.currentTarget.id)
    var nextNumber = e.currentTarget.dataset.currentindex + 1
    
    
    that.setData({
      changeCurrentIndex: nextNumber,
      videoBgcolor:""
    });
  },
  //暂停状态按钮
  videoPause:function(e) {
    var that = this;
    console.log(e);
    that.setData({
      isPlayAudio: true
    })
  },
  //播放状态按钮
  videoPlay:function(e){
    var that = this;
    console.log(e);
    that.setData({
      isPlayAudio: false
    })
  },
  //切换红包选中
  radioChange:function(e) {
    var that = this;
    console.log(e)
    this.setData({
      radioCheckVal: e.detail.value,
      radioIsDisabled:false
    }) 
  },
  //提交红包
  upLoadRedPack:function(e) {
    console.log(e.detail.target.dataset.radiovalue);
    wx.request({
      url: app.host + '/api/meeting/mini/create/course',
      method: 'POST',
      data: {
        id:e.detail.target.dataset.radiovalue
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res) {
        console.log('红包模版生成成功')
        wx.reLaunch({
          url: '../../pages/index/index?isEditComplete=true',
        })
      }

    })
  },
  //红包活动的我要制作按钮
  toRedPackActivity:function(){
    var that = this;
    that.setData({
      loadPageType:'redPack'
    })
  },
  //红包活动去到选择模版
  toRedPackTemplate:function(){
    var that = this;
    innerAudioContext.stop();
    console.log('红包内容');
    wx.request({
      url: app.host + '/api/meeting/mini/template/list',
      method: 'GET',
      header: {
        token: wx.getStorageSync('token')
      },
      success(res) {
        that.setData({
          redPackList: res.data.data,
          loadPageType: 'redPackTemplate'
        })
        console.log('贺卡列表', res.data.data)
      }
    })
  },
  //回到首页
  toHome:function() {
    var that = this;
    wx.reLaunch({
      url: '../../pages/index/index?isEditComplete=true',
    })
  }
})