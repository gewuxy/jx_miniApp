// pages/meeting/addPhoto.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],         //点击新增的图片
    popErrorMsg: "",  //顶部提示语，直接setData就能使用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log('跳转到addPhoto');
    var that = this;
    wx.getStorage({
      key: 'images',
      success: function (res) {
        console.log('获取到缓存嘛', res.data);
        // console.log(imgs);
        that.setData({
          imgs: res.data.imgs
        });

        console.log('干啊', that.data.imgs);
      },
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
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var images = this.data.imgs;
    if (images.length >= 9) {
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
    console.log('阿萨德',images.length);
    wx.chooseImage({
      count: 9 - images.length, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // //清空已经选中的图片
        // that.setData({ imgs: [] });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var images = that.data.imgs;
        console.log(tempFilePaths.length);
        // console.log(tempFilePaths + '----');
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (images.length > 9) {
            that.setData({
              imgs: images
            });
            return false;
          } else {
            images.push(tempFilePaths[i]);
          }
        }
        that.setData({
          imgs: images
        });
        //缓存数据
        wx.setStorage({
          key: 'images',
          data: {
            imgs: images
          },
          success: function (res) {
            console.log("存储成功");
          }
        });
      }
    });
  },

  // 删除图片
  deleteImg: function (e) {
    var that = this;
    var images = that.data.imgs;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '你确认要删除图片吗?',
      success(res) {
        console.log(res);
        if (res.confirm) {
          images.splice(index, 1);
          that.setData({
            imgs: images
          });
          //缓存数据
          wx.setStorage({
            key: 'images',
            data: {
              imgs: images
            },
            success: function (res) {
              console.log("存储成功");
            }
          });
        }
      },
      fail(res) {

      }
    })
  },

  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var images = this.data.imgs;

    wx.previewImage({
      //当前显示图片
      current: images[index],
      //所有图片
      urls: images
    })
  },
  toAddMeeting: function(){
    var that = this;
    console.log('图片个数',that.data.imgs.length);
    
    
    
    if (that.data.imgs.length > 0) {
      //跳转到新增图片页面
      wx.navigateTo({
        url: '../../pages/meeting/addMeeting'
      });
    }

  }
})