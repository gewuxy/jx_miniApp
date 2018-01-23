const app = getApp();

// pages/login/index.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
    bType: "primary", // 按钮类型
    actionText: "登录", // 按钮文字提示
    lock: false, //登录按钮状态，false表示未登录
    wxcode:"",
    wxSessionKey:"",
    getUnionId: false   //是否获取到unionId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (res) {
    // console.log('跳转到这个页面', res);
    // if(res.id == 2){
    //   console.log('加载页面执行事件');
    //   wx.showToast({
    //     title: '成功',
    //     icon: 'success',
    //     duration: 2000
    //   })
    // }
    console.log('loadPage', app.userInfo)
    // if (app.userInfo) {
    //   console.log('第一个IF');
    //   this.setData({
    //     userInfo: app.userInfo,
    //     hasUserInfo: true
    //   })
    //   console.log('appUserInfo', app.userInfo);
    // } else if (this.data.canIUse) {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    //   console.log('第二个IF');
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    //   console.log('已登录?');
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    that.audioCtx = wx.createAudioContext('myAudio')
    that.audioCtx.setSrc('https://file.medyaya.cn/course/1/audio/17122113442719879482.mp3');
    const backgroundAudioManager = wx.getBackgroundAudioManager();  
    backgroundAudioManager.src = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46';

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
  bindAction: function () {
    console.log('进入登录事件');
    wx.login({
      success: (res) => {
        console.log('首次登录', res);
        if (res.code) {
          //发起网络请求
          wx.request({
            url: app.host + 'api/user/mini/unionid',
            data: {
              code: res.code
            },
            success:(res) => {
              console.log('login', res);
              console.log(res.data.data.session_key);
              //微信js_code
              this.setData({ wxSessionKey: res.data.data.session_key});
              if (!res.data.data.unionid) {
                this.setData({ getUnionId:true });
              } else {
                this.setData({ getUnionId: false });
              }


                wx.hideLoading();
                wx.getUserInfo({
                  //是否带上登录状态
                  withCredentials: true,
                  success: (res) => {
                    //
                    console.log('userInfo', res);
                    console.log('wxSession', this.data.wxSessionKey);

                    if (this.data.getUnionId || res.encryptedData) {
                      //发起网络请求
                      wx.request({
                        url: app.host + 'api/user/mini/info',
                        data: {
                          encryptedData: res.encryptedData,
                          sessionKey: this.data.wxSessionKey,
                          iv: res.iv
                        },
                        success: (res) => {
                          console.log('encryptedData', res);
                          console.log(res.data.data.openId);
                          console.log(res.data.data.language);
                          console.log(res.data.data.unionId);
                        }
                      })
                    } else {
                      console.log('获取用户登录态失败！' + res.errMsg)
                    }


                    this.setData({
                      userInfo: {
                        avatarUrl: res.userInfo.avatarUrl,
                        nickName: res.userInfo.nickName
                      },
                      bType: "warn",
                      actionText: "退出登录"
                    });
                    // 存储用户信息到本地
                    wx.setStorage({
                      key: 'userInfo',
                      data: {
                        userInfo: {
                          avatarUrl: res.userInfo.avatarUrl,
                          nickName: res.userInfo.nickName
                        },
                        bType: "warn",
                        actionText: "退出登录"
                      },
                      success: function (res) {
                        console.log("存储成功")
                      }
                    })
                  }
                })

              




            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
        

      }
    })
  },
  getUserInfo: function (e) {
    // console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindPlay: function (){
    this.audioCtx.play();
    console.log('进入播放');
    console.log(this.audioCtx);
  },
  bgBindPlay: function() {

  }

})