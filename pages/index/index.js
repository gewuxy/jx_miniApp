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
    wxcode: "",
    wxSessionKey: "",
    getUnionId: false,   //是否获取到unionId
    motto: 'Hello World',
    changeCurrentIndex: 0,   //选中位标,
    meetingList: [],  //会议列表
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
    hasUserInfo: false,
    popErrorMsg: '小程序只显示录播会议哦！',  //顶部提示语，直接setData就能使用
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCardStatus:true
  },
  onLoad: function () {
    var that = this;
    // var userStorageInfoUser = wx.getStorageSync('userInfo');
    // var userStorageToken = wx.getStorageSync('token');

    //获取缓存
    var userInfoStorage = wx.getStorageSync('userInfo');
    if (userInfoStorage) {
      this.setData({
        userInfo: {
          avatarUrl: userInfoStorage.userInfo.avatarUrl,
          nickName: userInfoStorage.userInfo.nickName
        }
      })
    }
    console.log(userInfoStorage);
    console.log('tokenIndex', wx.getStorageSync('token'));
    console.log('获取值', app);
    console.log('获取值', app.globalData);
    console.log('获取值token', app.globalData.UserToken);



    app.getUserInfo().then(function (res) {
      console.log(res);
      if (res.status == 200) {
        var auth_key = res.data;
        that.setData({
          userInfo: app.globalData.userInfo
        })
        console.log(1);
        console.log(app);
        console.log(app.globalData);
      } else {
        console.log(res.data);
      }
    });






  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    

  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../login/index?id=2&abc=6'
    })
  },
  //下拉刷新
  onPullDownRefresh: function(){
    wx.request({
      url: '',
      data: {},
      method: 'GET',
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {
        wx.stopPullDownRefresh();
      }
    })
    util.ohShitfadeOut(this);
  },
  //上拉加载更多
  onReachBottom:function(){
    this.setData({ popErrorMsg: '小程序只显示录播会议哦！'})
    console.log('下滑加载更多');
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
  },
  getUserInfo: function (e) {
    console.log(e)
    app.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  times1:function(){
    var time = setInterval(function () {
      // 因为一开始缓存当中指定的key为假当为真的时候就说明上一步成功了这时候就可以开始发送下一步的请求了
      var userInfoStorage = wx.getStorageSync('userInfo')
      console.log(userInfoStorage);

      clearTimeout(time);
    })
  }

  
})
