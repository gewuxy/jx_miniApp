//index.js
//获取应用实例
const app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    // 用户信息
    lock: false, //登录按钮状态，false表示未登录
    changeCurrentIndex: 0,   //选中位标,
    meetingList: [],  //会议列表
    pushMeetingList: [],  //加载后的会议列表
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
    avatar: "",
    imgs: [],         //点击新增的图片
    token: "",
    popErrorMsg: "",  //顶部提示语，直接setData就能使用
    meetingListPageNum:1,   //分页数
    meetingListPageSize: 6,   //每页个数
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCardStatus:false,
    courseId:"",
    isEditComplete:false,
    meetingPassword:"",
    sharePages:""
  },
  // 监听页面加载，只执行一次
  onLoad: function (options) {
    //刷新显示列表
    if (options.isEditComplete) {
      this.setData({
        isEditComplete: options.isEditComplete
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var userStorageInfoUser = wx.getStorageSync('userInfo');
    var userStorageToken = wx.getStorageSync('token');

    this.setData({
      popErrorMsg: '小程序只显示录播会议哦！'
    });

    
    //已有Token缓存
    if (userStorageToken && userStorageInfoUser) {
      //设置数据
      this.setData({
        userInfo: userStorageInfoUser.userInfo,
        token: userStorageToken,
        avatar: wx.getStorageSync('avatar')
      });
      
      //判断是否有缓存
      if (wx.getStorageSync('indexShowMeeting') && that.data.isEditComplete == 'true'){
        //修改完成后要刷新数据
        wx.request({
          url: app.host + '/api/meeting/list',
          method: 'GET',
          data: {
            pageSize: that.data.meetingListPageSize,
            pageNum: 1
          },
          header: {
            token: userStorageToken
          },
          success(res) {
            console.log(res);
            that.setData({
              meetingList: res.data.data.list
            });
            // 存储会议到本地
            wx.setStorage({
              key: 'indexShowMeeting',
              data: {
                meetingList: res.data.data.list
              },
              success: function (res) {
                console.log("修改完成后要刷新数据,存储成功");
              }
            });
          }
        });
      } else if (wx.getStorageSync('indexShowMeeting') && that.data.isEditComplete == false){
        //有缓存
        console.log('有缓存', wx.getStorageSync('indexShowMeeting'));
        that.setData({ meetingList: wx.getStorageSync('indexShowMeeting').meetingList });
      } else {
        console.log('没缓存哦');
        // 加载会议列表
        wx.request({
          url: app.host + '/api/meeting/list',
          method: 'GET',
          data: {
            pageSize: that.data.meetingListPageSize,
            pageNum: that.data.meetingListPageNum
          },
          header: {
            token: userStorageToken
          },
          success(res) {
            console.log(res);
            that.setData({
              meetingList: res.data.data.list,
              avatar: wx.getStorageSync('avatar'),
            });

          }
        });
      }
      //打印缓存数据
      console.log(userStorageInfoUser);
      console.log('tokenIndex', wx.getStorageSync('token'));
    } else {
      wx.showLoading({ title: '加载中' });
      //第一次访问
      app.getUserInfo().then(function (res) {
        console.log('访问前', res);
        if (res.status == 200) {
          //设置数据
          that.setData({
            userInfo: app.globalData.userInfo
          });
          // 加载会议列表
          wx.request({
            url: app.host + '/api/meeting/list',
            method: 'GET',
            data: {
              pageSize: that.data.meetingListPageSize,
              pageNum: that.data.meetingListPageNum
            },
            header: {
              token: app.globalData.UserToken
            },
            success(res) {
              console.log('show',res);
              that.setData({
                meetingList: res.data.data.list,
                token: app.globalData.UserToken,
                avatar: app.globalData.avatar
              });
              // 存储会议到本地
              wx.setStorage({
                key: 'indexShowMeeting',
                data: {
                  meetingList: res.data.data.list
                },
                success: function (res) {
                  console.log("存储成功");
                }
              });
            }
          });
        } else {
          console.log(res.data);
        }
      });
    }

    util.ohShitfadeOut(that);

  },
  /**
 * 生命周期函数--监听页面卸载
 */
  onUnload: function () {

  },
  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../my/index'
    })
  },
  //下拉刷新
  onPullDownRefresh: function(){
    var that = this;
    //刷新显示列表
    that.setData({ meetingListPageNum: 1 });
    wx.request({
      url: app.host + '/api/meeting/list',
      method: 'GET',
      data: {
        pageSize: that.data.meetingListPageSize,
        pageNum: that.data.meetingListPageNum
      },
      header: {
        token: that.data.token
      },
      success(res) {
        that.setData({
          meetingList: res.data.data.list
        });
      },
      complete: function (res) {
        wx.stopPullDownRefresh();
      }
    });
  },
  //上拉加载更多
  onReachBottom:function(){
    var that = this;
    console.log(that.data.meetingList);
    //新增后的数据
    var result = that.data.meetingList;
    this.setData({ 
      meetingListPageNum: that.data.meetingListPageNum + 1
    });
    wx.request({
      url: app.host + '/api/meeting/list',
      method: 'GET',
      data: {
        pageSize: that.data.meetingListPageSize,
        pageNum: that.data.meetingListPageNum
      },
      header: {
        token: that.data.token
      },
      success(res) {
        console.log(res);
        //增加会议到数组里
        for (var i = 0; i < that.data.meetingList.length; i += that.data.meetingListPageSize) {
          result = result.concat(res.data.data.list.slice(i, i+that.data.meetingListPageSize));
        }
        that.setData({
          meetingList: result
        });
        // 存储会议数据到本地
        wx.setStorage({
          key: 'indexShowMeeting',
          data: {
            meetingList: result
          },
          success: function (res) {
            console.log("存储会议成功");
          }
        });
      },
      complete: function (res) {

      }
    });
  },
  //分享按钮
  onShareAppMessage: function (options){
    console.log('点击分享',options);
    var that = this;
    console.log('为什么没有',that.data);
    return {
      title: '你的朋友发来分享',
      path: that.data.sharePage
    }
  },
  //切换列表状态
  changeListStatus:function(){
    var that = this;
    var isCardStatus = that.data.isCardStatus === true ? false : true;
    this.setData({
      isCardStatus: isCardStatus
    })
  },
  //上传图片并跳转
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    //清空已经选中的图片
    that.setData({ imgs:[] });

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
  showImage:function(e){
    var that = this;
    console.log(e);
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: ['https://timgsa.baidu.com/timg?image&quality=80&size=b10000_10000&sec=1516084229&di=307386df25650d9d5ab51c33a193c6bb&src=http://www.sd-i.cn/uploadfile/2013/0628/20130628120240861.jpg'] // 需要预览的图片http链接列表
    })
  },
  //显示自定义弹窗
  showModal: function (e) {
    var that = this;
    var sharePage = "";
    console.log('弹出',e);
    if (e.currentTarget.dataset.meetingpassword) {
      sharePage = `/pages/player/index?courseId=${e.currentTarget.dataset.courseid}&loadPageType=meetingPassword`
    } else {
      sharePage = `/pages/player/index?courseId=${e.currentTarget.dataset.courseid}`
    }
    that.setData({ 
      courseId: e.currentTarget.dataset.courseid,
      meetingPassword: e.currentTarget.dataset.meetingpassword,
      sharePage: sharePage
    });
    console.log(that.data);
    util.showModal(that);
  },
  //隐藏自定义弹窗
  hideModal: function () {
    var that = this;
    util.hideModal(that);
  },
  //编辑标题
  toMeetingEdit:function() {
    var that = this;
    console.log(that.data.courseId);
    that.hideModal();
    wx.navigateTo({
      url: `../../pages/meeting/addMeeting?courseId=${that.data.courseId}&isEditMeeting=true`
    });
  },
  //删除会议
  deleteMeeting:function(){
    var that = this;
    wx.showModal({
      title: '删除会议?',
      content: '确认后将无法恢复',
      success(res){
        if(res.confirm) {
          console.log('确认删除',res);
          wx.showLoading({
            title: '删除中...',
          })
          wx.request({
            url: app.host + '/api/meeting/delete',
            method: 'POST',
            data: {
              id: that.data.courseId,
            },
            header: {
              token: wx.getStorageSync('token'),
              "Content-Type": "application/x-www-form-urlencoded"   //处理 POST BUG 问题
            },
            success(res) {
              console.log('是否成功', res);

              wx.hideLoading();
              if(res.data.code == 0) {
                wx.redirectTo({
                  url: '../../pages/index/index?isEditComplete=true',
                })
              } else {
                console.log('删除失败',res.data.err);
              }

            }

          })
          wx.hideLoading();
          that.hideModal();
        }
        console.log(res);
      }
    })

  },
  //设置&显示会议密码
  toMettingPassword:function(){
    var that = this;
    that.hideModal();
    if (that.data.meetingPassword) {
      wx.navigateTo({
        url: `../../pages/player/pagePassword?courseId=${that.data.courseId}&meetingPassword=${that.data.meetingPassword}&loadPageType=showMeetingPassword`
      });
    } else {
      wx.navigateTo({
        url: `../../pages/player/pagePassword?courseId=${that.data.courseId}&loadPageType=setMeetingPassword`
      });
    }
  },
  //生成二维码
  toMettingQRcode:function(){
    var that = this;
    that.hideModal();
    wx.navigateTo({
      url: `../../pages/player/index?courseId=${that.data.courseId}&loadPageType=showQRcode`
    });
  },
  toMeetingDetails:function(e){
    var that = this;
    that.setData({
      courseId: e.currentTarget.dataset.courseid,
      meetingPassword: e.currentTarget.dataset.meetingpassword
    });
    if (e.currentTarget.dataset.meetingpassword) {
      wx.navigateTo({
        url: `../../pages/player/index?courseId=${that.data.courseId}&loadPageType=meetingPassword`
      });
    } else {
      wx.navigateTo({
        url: `../../pages/player/index?courseId=${that.data.courseId}`
      });
    }
  },
  toRecordPage:function() {
    var that = this;
    wx.navigateTo({
      url: `../../pages/record/index?courseId=17004`
    });
  }
})
