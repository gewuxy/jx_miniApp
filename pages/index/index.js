//index.js
//获取应用实例
const app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    // 用户信息

    bType: "primary", // 按钮类型
    actionText: "登录", // 按钮文字提示
    lock: false, //登录按钮状态，false表示未登录
    changeCurrentIndex: 0,   //选中位标,
    meetingList: [],  //会议列表
    pushMeetingList: [],  //加载后的会议列表
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
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
          console.log(res.data.data.list);
          console.log(that.data);
          that.setData({
            meetingList: res.data.data.list,
            token: userStorageToken
          });

        }
      });

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
                token: app.globalData.UserToken
              });
            }
          });
        } else {
          console.log(res.data);
        }
      });
    }

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../login/index?id=2&abc=6'
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
    util.ohShitfadeOut(that);
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
    console.log(1);
  },
  //切换列表状态
  changeListStatus:function(){
    var that = this;
    var isCardStatus = that.data.isCardStatus === true ? false : true;
    this.setData({
      isCardStatus: isCardStatus
    })
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
