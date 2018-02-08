// pages/meeting/addMeeting.js
const app = getApp();
var util = require('../../utils/util.js');
const innerAudioContext = wx.createInnerAudioContext();   //实例音频
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadPageType:"",     //判断页面
    imgs:[],
    token:"",
    imgsFile: [],
    meetingTitle:"",
    popErrorMsg:"",
    courseId:"",
    isEditMeeting:false,
    submitButtonType:"",     //提交后的信息
    addMeetingBgList:[],       //主题背景列表
    radioCheckVal:"",         //背景的值
    firstCoverImg:"",        //封面或者第一张上传的图片
    isShowMeetingBg:false,    //是否主题预览图
    showMeetingImg:"",       //传过去的主题
    meetingBgTitle:"更多",
    musicList:[],          //音乐列表
    isMusicPlay:0,
    radioCheckMusicVal:"",
    meetingBgChecked:false,
    currentMusicTitle:"",
    currentMusicTime:0,
    isCurrentMusic:false,
    addMeetingBgMoreList:[],
    currentMusicId:0
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
      if (options.isEditMeeting){
        //标题缓存
        wx.setStorageSync('addMeetingEdit', options.isEditMeeting);
      }
    }
    wx.getStorage({
      key: 'images',
      success: function (res) {
        that.setData({
          imgs: res.data.imgs,
          firstCoverImg: res.data.imgs[0]
        });
        console.log('哇哈哈哈', that.data.imgs);
        console.log('获取第一张图', that.data.firstCoverImg);
      },
    });
    //页面Page切换不同页面
    if (options.loadPageType == "addMeetingMusic") {
      wx.setNavigationBarTitle({ title: '添加音乐' });
      that.setData({
        loadPageType: options.loadPageType
      })
      wx.request({
        url: app.host + '/api/meeting/theme/music/more',
        method: 'GET',
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('加载更多音乐', res);
          that.setData({
            musicList:res.data.data.list
          })
        }

      })

    } else if (options.loadPageType == "moreAddMettingBg") {
      wx.setNavigationBarTitle({ title: '选择主题' });
      var isShowMusic = wx.getStorageSync('addMeetingMusic') ? true : false
      that.setData({
        loadPageType: options.loadPageType,
        isCurrentMusic: isShowMusic
      })
      //加载更多主题
      wx.request({
        url: app.host + '/api/meeting/theme/image/more',
        method: 'GET',
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('加载更多背景', res);
          that.setData({
            addMeetingBgMoreList: res.data.data.list
          })
        }

      })
    }
    
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

    //更新主题缓存
    if(wx.getStorageSync('addMeetingBg')){
      //更新现在的数据
      this.setData({
        meetingBgTitle: wx.getStorageSync('addMeetingBg').meetingBgTitle,
        radioCheckVal: wx.getStorageSync('addMeetingBg').id
      })
    }
    //更新标题缓存
    if (wx.getStorageSync('addMeetingTitle')){
      //更新现在的数据
      this.setData({
        meetingTitle: wx.getStorageSync('addMeetingTitle')
      })
    }
    //更新音乐缓存
    if (wx.getStorageSync('addMeetingMusic')) {
      var isShowMusic = wx.getStorageSync('addMeetingMusic') ? true : false

      console.log('是不是选中音乐', isShowMusic)

      //更新现在的数据
      this.setData({
        currentMusicTitle: wx.getStorageSync('addMeetingMusic').meetingMuiscTitle,
        currentMusicTime: wx.getStorageSync('addMeetingMusic').meetingMuiscTime,
        currentMusicId: wx.getStorageSync('addMeetingMusic').id,
        isCurrentMusic: isShowMusic
      })
      
    }


    //如果是从编辑进来
    if (wx.getStorageSync('addMeetingEdit')=='true' && that.data.courseId != "") {
      console.log('进来了');
      //清空缓存（图片，主题，背景音乐，标题）
      wx.removeStorageSync('images');
      wx.removeStorageSync('addMeetingBg');
      wx.removeStorageSync('addMeetingMusic');
      wx.removeStorageSync('addMeetingTitle');

      wx.request({
        url: app.host + '/api/meeting/edit',
        method: 'GET',
        data: {
          courseId: that.data.courseId
        },
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('编辑状态', res);
          //如果没有主题
          if(res.data.data.theme) {

            var isShowMusic = res.data.data.theme.url ? true : false
            console.log('对吗',isShowMusic);
            that.setData({
              isEditMeeting: wx.getStorageSync('addMeetingEdit'),
              meetingTitle: res.data.data.course.title,
              addMeetingBgList: res.data.data.imageList,
              currentMusicTitle: res.data.data.theme.name,
              currentMusicTime: res.data.data.theme.timeStr,
              meetingBgTitle: res.data.data.theme.imgName,
              radioCheckVal: res.data.data.theme.imageId,
              firstCoverImg: res.data.data.course.coverUrl,
              isCurrentMusic: isShowMusic
            });

            //更新所有的缓存
            //标题缓存
            wx.setStorageSync('addMeetingTitle', res.data.data.course.title);
            //音乐缓存
            wx.setStorage({
              key: 'addMeetingMusic',
              data: {
                meetingMuiscTitle: res.data.data.theme.name,
                id: res.data.data.theme.musicId,
                meetingMuiscTime: res.data.data.theme.timeStr
              },
              success: function (res) {
                console.log("存储成功");
              }
            });
            //主题缓存
            wx.setStorage({
              key: 'addMeetingBg',
              data: {
                meetingBgTitle: res.data.data.theme.imgName,
                id: res.data.data.theme.imageId
              },
              success: function (res) {
                console.log("存储成功");
              }
            });
          } else {
            that.setData({
              isEditMeeting: wx.getStorageSync('addMeetingEdit'),
              meetingTitle: res.data.data.course.title,
              addMeetingBgList: res.data.data.imageList,
              firstCoverImg: res.data.data.course.coverUrl,
              meetingBgTitle: "更多",
              radioCheckVal: 0
            });
          }

        }

      })
    } else {
      console.log('新建进来')
      //新建进来
      wx.request({
        url: app.host + '/api/meeting/edit',
        method: 'GET',
        header: {
          token: wx.getStorageSync('token')
        },
        success(res) {
          console.log('新建状态', res);
          that.setData({
            addMeetingBgList:res.data.data.imageList
          })
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
    var thatMeetingBg = wx.getStorageSync('addMeetingBg') ? wx.getStorageSync('addMeetingBg').id:0
    var thatMeetingMusic = wx.getStorageSync('addMeetingMusic') ? wx.getStorageSync('addMeetingMusic').id : 0

    wx.request({
      url: app.host + '/api/meeting/mini/update',
      method:'POST',
      data:{
        courseId: courseId,
        title: that.data.meetingTitle,
        musicId:thatMeetingMusic,
        imgId: thatMeetingBg
      },
      header: {
        token: wx.getStorageSync('token'),
        "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
      },
      success(res){
        console.log(res);
        wx.hideLoading();
        if (that.data.submitButtonType == 'save') {
          wx.reLaunch({
            url: '../../pages/index/index?isEditComplete=true',
          })
        } else if (that.data.submitButtonType == 'record') {
          wx.navigateTo({
            url: '../../pages/record/index?courseId='+courseId,
          })
        }
        
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
    console.log('提交后得到的信息',e);
    console.log(that.data.isEditMeeting);


    // 判断是那个按钮进入上传
    that.setData({
      submitButtonType: e.detail.target.dataset.buttontype
    })

    if (e.detail.value.meetingTitle != "") {
      //设置标题
      that.setData({ meetingTitle: e.detail.value.meetingTitle});
    } else {
      that.setData({ popErrorMsg : '标题不能为空'});
      util.ohShitfadeOut(that);
      return false;
    }
    wx.showLoading({ title: '上传中', mask:true });
    if (wx.getStorageSync('addMeetingEdit') == 'true' && that.data.courseId != "") {
      //判断是编辑状态
      that.createMeeting(that.data.courseId);
      console.log('进来编辑');
    } else {

      
      that.uploadDIY(tempFilePaths, i, length);
    }
    
    
  },
  //切换主题
  radioChange:function(e){
    var that = this;
    console.log('切换主题',e)
    this.setData({
      radioCheckVal: e.detail.value
    })
  },
  //点击图片切换标题
  radioChangeImg:function(e) {
    var that = this;
    console.log('点击后获取',e.currentTarget.dataset)
    console.log(that.data.radioCheckVal, "-", e.currentTarget.dataset.valueid);
    if (e.currentTarget.dataset.valueid == that.data.radioCheckVal) {
      //重复点选，删除背景
      wx.setStorage({
        key: 'addMeetingBg',
        data: {
          meetingBgTitle: "更多",
          id: 0
        },
        success: function (res) {
          console.log("存储成功");
        }
      });
      //更新现在的数据
      this.setData({
        meetingBgTitle: "更多",
        radioCheckVal: 0
      })
    } else {
      //选择新的列表
      wx.setStorage({
        key: 'addMeetingBg',
        data: {
          meetingBgTitle: e.currentTarget.dataset.meetingimgtitle,
          id: e.currentTarget.dataset.valueid
        },
        success: function (res) {
          console.log("存储成功");
        }
      });
      //更新现在的数据
      this.setData({
        meetingBgTitle: e.currentTarget.dataset.meetingimgtitle,
        radioCheckVal: e.currentTarget.dataset.valueid
      })
    }


  },
  //点击预览主题
  showAddMeetingBg:function(e) {
    var that = this;
    console.log('获得背景图', e);
    console.log('获得背景图', e.currentTarget.dataset.addmeetingbg);
    that.setData({
      isShowMeetingBg: true,
      showMeetingImg:e.currentTarget.dataset.addmeetingbg
    })

    
  },
  //关闭预览主题
  showMeetingBgClose:function() {
    var that = this;
    that.setData({
      isShowMeetingBg:false
    })
    console.log('关闭');
  },
  //背景音乐页面
  toAddmeetingMusic:function() {
    var that = this;
    if (that.data.courseId) {
      wx.navigateTo({
        url: `../../pages/meeting/addMeeting?loadPageType=addMeetingMusic&courseId=${that.data.courseId}`
      })
    } else {
      wx.navigateTo({
        url: '../../pages/meeting/addMeeting?loadPageType=addMeetingMusic'
      })
    }
    
  },
  //监控输入框(实时保存)
  addMeetingTitle:function(e){
    console.log('实时输入',e.detail.value);
    wx.setStorageSync('addMeetingTitle', e.detail.value);
  },
  //播放音乐
  playMusic:function(e){
    var that = this;
    console.log('播放音乐',e);
    innerAudioContext.src = e.currentTarget.dataset.musicurl;
    innerAudioContext.play();
    that.setData({
      isMusicPlay:e.currentTarget.dataset.index
    })
    
  },
  //暂停音乐
  pauseMusic:function(e){
    var that = this;
    innerAudioContext.pause();
    that.setData({
      isMusicPlay: false
    })
  },
  //选中音乐
  radioMusic:function(e) {
    var that = this;
    console.log(e.currentTarget.dataset);
    //选择新的列表
    wx.setStorage({
      key: 'addMeetingMusic',
      data: {
        meetingMuiscTitle: e.currentTarget.dataset.muisctitle,
        id: e.currentTarget.dataset.id,
        meetingMuiscTime: e.currentTarget.dataset.muisctime
      },
      success: function (res) {
        console.log("存储成功");
      }
    });
    //更新现在的数据
    this.setData({
      loadPageType: "",
      currentMusicTitle: e.currentTarget.dataset.muisctitle,
      currentMusicTime: e.currentTarget.dataset.muisctime,
      currentMusicId: e.currentTarget.dataset.id,
      isCurrentMusic:true,
      courseId: that.data.courseId
    })
    //暂停音乐
    innerAudioContext.stop();
  },
  //删除音乐
  removeMusic:function(e){
    var that = this;
    console.log(e);
    //更新缓存
    wx.setStorage({
      key: 'addMeetingMusic',
      data: {
        meetingMuiscTitle: "",
        id: 0,
        meetingMuiscTime: 0
      },
      success: function (res) {
        console.log("存储成功");
      }
    });
    //更新现在的数据
    this.setData({
      currentMusicTitle: "",
      currentMusicTime: 0,
      isCurrentMusic: false
    })
  },
  //更多主题
  moreAddMeetingBg:function(e) {
    var that = this;
    if (that.data.courseId) {
      wx.navigateTo({
        url: `../../pages/meeting/addMeeting?loadPageType=moreAddMettingBg&courseId=${that.data.courseId}`
      })
    } else {
      wx.navigateTo({
        url: '../../pages/meeting/addMeeting?loadPageType=moreAddMettingBg'
      })
    }


  },
  //主题保存按钮
  toaddMeetingPage:function() {
    var that = this;
    that.setData({
      loadPageType:""
    })
  }
})