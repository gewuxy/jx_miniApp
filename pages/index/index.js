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
    meetingListPageSize: 3,   //每页个数
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCardStatus:false
  },
  // 监听页面加载，只执行一次
  onLoad: function () {
    //刷新显示列表
    this.setData({ meetingListPageNum : 1});
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
      //设置数据
      this.setData({
        userInfo: userStorageInfoUser.userInfo
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
          token: userStorageToken
        },
        success(res) {
          console.log(res);
          that.setData({
            meetingList: res.data.data.list,
            token: userStorageToken,
            avatar: wx.getStorageSync('avatar'),
          });

        }
      });
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
              that.setData({
                meetingList: res.data.data.list,
                token: app.globalData.UserToken,
                avatar: app.globalData.avatar
              });
            }
          });
        } else {
          console.log(res.data);
        }
      });
    }

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
    //新增后的数据
    var result = that.data.meetingList;
    this.setData({ 
      popErrorMsg: '小程序只显示录播会议哦！' ,
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
        //增加会议到数组里
        for (var i = 0; i < that.data.meetingList.length; i += that.data.meetingListPageSize) {
          result = result.concat(res.data.data.list.slice(i, i+that.data.meetingListPageSize));
        }
        that.setData({
          meetingList: result
        });
      },
      complete: function (res) {

      }
    });
  },
  //分享按钮
  onShareAppMessage: function (options){
    console.log('点击分享');
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
  }
})
