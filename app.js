const host = 'https://www.cspmeeting.com/csp';

//app.js
App({
  onShow() {

  },
  getUserInfo:function () {
    var that = this;
    //异步更新全局函数
    return new Promise(function (resolve, reject) {
      // 调用登录接口
      wx.login({
        success: function (res) {
          if (res.code) {
            that.globalData.code = res.code;
            //调用登录接口
            wx.getUserInfo({
              withCredentials: true,
              success: function (res) {
                that.globalData.UserRes = res;
                that.globalData.userInfo = res.userInfo;
                wx.request({
                  url: `${host}/api/user/mini/unionid`,
                  method: 'GET',
                  data: {
                    code: that.globalData.code,
                  },
                  success(data) {
                    console.log('请求code',data);
                    //是否已经注册
                    if (data.data.data.has_user) {
                      console.log('已注册')
                      wx.request({
                        url: `${host}/api/user/login`,
                        method: "GET",  //POST有问题
                        data: {
                          thirdPartyId: 1,
                          uniqueId: data.data.data.unionid
                        },
                        success: (res) => {
                          that.globalData.userInfo = res.data.data;
                          that.globalData.UserToken = res.data.data.token;
                          that.globalData.avatar = res.data.data.avatar;
                          //保存token到本地
                          wx.setStorageSync('token', res.data.data.token);
                          wx.setStorageSync('avatar', res.data.data.avatar);
                          wx.setStorageSync('nickName', res.data.data.nickName);

                          // console.log(that.globalData.avatar);
                          // 存储用户信息到本地
                          wx.setStorage({
                            key: 'userInfo',
                            data: {
                              userInfo: that.globalData.userInfo
                            },
                            success: function (res) {
                              console.log("存储成功");
                            }
                          });
                          //使用 Promise 回调的值
                          var res = {
                            status: 200,
                            userInfo: that.globalData.userInfo,
                            token: that.globalData.UserToken,
                            avatar: that.globalData.avatar
                          }
                          resolve(res);
                        }
                      })
                    } else {
                      //能否获取到unionid
                      if (data.data.data.unionid) {
                        // 注册登录微信
                        wx.request({
                          url: `${host}/api/user/login`,
                          method: "GET",
                          data: {
                            thirdPartyId: 1,
                            uniqueId: data.data.data.unionid,
                            nickName: res.userInfo.nickName,
                            gender: res.userInfo.gender,
                            country: res.userInfo.country,
                            province: res.userInfo.province,
                            city: res.userInfo.city,
                            avatar: res.userInfo.avatarUrl,
                          },
                          success: (res) => {
                            that.globalData.userInfo = res.data.data;
                            that.globalData.UserToken = res.data.data.token;
                            //保存token到本地
                            wx.setStorageSync('token', res.data.data.token);
                            wx.setStorageSync('avatar', res.data.data.avatar);
                            wx.setStorageSync('nickName', res.data.data.nickName);
                            // 存储用户信息到本地
                            wx.setStorage({
                              key: 'userInfo',
                              data: {
                                userInfo: that.globalData.userInfo
                              },
                              success: function (res) {
                                console.log("存储成功");
                              }
                            });
                            //使用 Promise 回调的值
                            var res = {
                              status: 200,
                              userInfo: that.globalData.userInfo,
                              token: that.globalData.UserToken,
                              avatar: that.globalData.avatar
                            }
                            resolve(res);
                          }
                        });

                      } else {
                        //获取不到unionuid
                        wx.request({
                          url: `${host}/api/user/mini/info`,
                          method: 'GET',
                          data: {
                            encryptedData: res.encryptedData,
                            sessionKey: data.data.data.session_key,
                            iv: res.iv
                          },
                          success: (res) => {
                            console.log(res);
                            // 注册登录微信
                            wx.request({
                              url: `${host}/api/user/login`,
                              method: "GET",
                              data: {
                                thirdPartyId: 1,
                                uniqueId: res.data.data.unionId,
                                nickName: res.data.data.nickName,
                                gender: res.data.data.gender,
                                country: res.data.data.country,
                                province: res.data.data.province,
                                city: res.data.data.city,
                                avatar: res.data.data.avatarUrl,
                              },
                              success: (res) => {
                                console.log(res);
                                that.globalData.userInfo = res.data.data;
                                that.globalData.UserToken = res.data.data.token;
                               
                                //保存token到本地
                                wx.setStorageSync('token', res.data.data.token);
                                wx.setStorageSync('avatar', res.data.data.avatar);
                                wx.setStorageSync('nickName', res.data.data.nickName);
                                // 存储用户信息到本地
                                wx.setStorage({
                                  key: 'userInfo',
                                  data: {
                                    userInfo: that.globalData.userInfo
                                  },
                                  success: function (res) {
                                    console.log("存储成功");
                                  }
                                });
                                //使用 Promise 回调的值
                                var res = {
                                  status: 200,
                                  userInfo: that.globalData.userInfo,
                                  token: that.globalData.UserToken,
                                  avatar: that.globalData.avatar
                                }
                                resolve(res);

                              }
                            });
                          }
                        })
                      }
                    }

                    wx.hideLoading();
                  },
                  fail(res) {
                    console.log('请求服务器有问题');
                  }
                })
              },
              fail:function(res){
                wx.hideLoading();
                wx.showModal({
                  title: '授权提示',
                  content: '小程序功能需要授权才能正常使用噢！请点击“确定”-“用户信息”再次授权',
                  showCancel: false,
                  success: function(res){
                    wx.openSetting({
                      success: (res) => {
                        if (that.globalData.errorBoll){
                          //回调获取缓存
                          that.getUserInfo();
                          //防止二次加载
                          that.globalData.errorBoll = true;
                        }
                      },
                      fail: function(res){
                        // 提示版本过低
                        wx.showModal({
                          title: '提示',
                          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                        })
                      }
                    })
                  }
                })
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg);
            var res = {
              status: 300,
              data: '错误'
            }
            reject('error');
          }
        }
      })
    });
  },
  globalData:{
    //防止重复加载
    errorBoll:false
  },
  host
})