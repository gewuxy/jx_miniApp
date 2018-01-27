const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//转化时间
const formatTimes = msd => {

  var time = parseFloat(msd) ;
  if (null != time && "" != time) {
    if (time > 60 && time < 60 * 60) {
      time = parseInt(time / 60.0) + ":" + parseInt((parseFloat(time / 60.0) -
        parseInt(time / 60.0)) * 60) + "";
    }
    // else if (time >= 60 * 60 && time < 60 * 60 * 24) {
    else if (time >= 60 * 60) {
      time = parseInt(time / 3600.0) + ":" + parseInt((parseFloat(time / 3600.0) -
        parseInt(time / 3600.0)) * 60) + ":" +
        parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
          parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "";
    }
    else {
      time = parseInt(time) + "";
    }
  }
  return time;

}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 去前后空格  
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// 提示错误信息  
function isError(msg, that) {
  that.setData({
    showTopTips: true,
    errorMsg: msg
  })
}

// 清空错误信息  
function clearError(that) {
  that.setData({
    showTopTips: false,
    errorMsg: ""
  })
}

//定时器提示框3秒消失  
function ohShitfadeOut(that) {  
  var fadeOutTimeout = setTimeout(() => {
    that.setData({ popErrorMsg: '' });
    clearTimeout(fadeOutTimeout);
  }, 3000);
}

//显示自定义图层
function showModal(that) {
  // 显示遮罩层
  var animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  that.animation = animation
  animation.translateY(300).step()
  that.setData({
    animationData: animation.export(),
    showModalStatus: true
  })
  setTimeout(function () {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export()
    })
  }.bind(that), 200)
}

//隐藏自定义图层
function hideModal(that) {
  // 隐藏遮罩层
  var animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  that.animation = animation
  animation.translateY(300).step()
  that.setData({
    animationData: animation.export(),
  })
  setTimeout(function () {
    animation.translateY(0).step()
    that.setData({
      animationData: animation.export(),
      showModalStatus: false
    })
  }.bind(that), 200)
}



module.exports = {
  formatTime: formatTime,
  formatTimes: formatTimes,
  ohShitfadeOut:ohShitfadeOut,
  showModal: showModal,
  hideModal: hideModal
}
