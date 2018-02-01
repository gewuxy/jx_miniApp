//秒转时分
const formatTime = (number, format) => {

  var formateArr = ['h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  // returnArr.push(date.getFullYear());
  // returnArr.push(formatNumber(date.getMonth() + 1));
  // returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;

}
//毫秒转时分
const formatTimes = (number, format) => {

  var formateArr = [ 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number);
  // returnArr.push(date.getFullYear());
  // returnArr.push(formatNumber(date.getMonth() + 1));
  // returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;  

}
//时分转秒
const timeToSec = function (time) {
  var s = '';

  // var hour = time.split(':')[0];
  var min = time.split(':')[0];
  var sec = time.split(':')[1];

  // s = Number(hour * 3600) + Number(min * 60) + Number(sec);
  s = Number(min * 60) + Number(sec);

  return s;
};

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
  console.log(that);
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

//数组相加
function arraySum(DurationArray) {
  var result = 0;
  for (var i = 0; i < DurationArray.length; i++) {
    result += DurationArray[i];
  }
  return result;
};


module.exports = {
  formatTime: formatTime,
  formatTimes: formatTimes,
  ohShitfadeOut:ohShitfadeOut,
  showModal: showModal,
  hideModal: hideModal,
  arraySum: arraySum,
  timeToSec: timeToSec
}
