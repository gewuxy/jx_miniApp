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

                    console.log(data);
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
                          that.globalData.UserToken = res.data.data.token;
                          //保存token到本地
                          wx.setStorageSync('token', res.data.data.token);
                        }
                      })
                    } else {
                      //能否获取到unionid
                      console.log(data);
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
                            that.globalData.UserToken = res.data.data.token;
                            //保存token到本地
                            wx.setStorageSync('token', res.data.data.token);
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
                                that.globalData.UserToken = res.data.data.token;
                                //保存token到本地
                                wx.setStorageSync('token', res.data.data.token);

                              }
                            });
                          }
                        })
                      }
                    }
                    // 存储用户信息到本地
                    wx.setStorage({
                      key: 'userInfo',
                      data: {
                        userInfo: {
                          avatarUrl:that.globalData.userInfo.avatarUrl,            //头像
                          nickName:that.globalData.userInfo.nickName,              //用户名
                          city:that.globalData.userInfo.city,                      //城市
                          country:that.globalData.userInfo.country,                //国家
                          province:that.globalData.userInfo.province,              //省份
                          gender:that.globalData.userInfo.gender                   //性别
                        }
                      },
                      success: function (res) {
                        console.log("存储成功");
                      }
                    })
                  }
                })
                wx.setStorage({
                  key: "auth_key",
                  data: res.userInfo
                })
                var res = {
                  status: 200,
                  data: res.userInfo
                }
                resolve(res);
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
  userInfo: {},
  globalData:{

  },
  host,
  token:"",
  add:'你好吗'
})