const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getDate = () => {
  var dateObj = new Date(),
      y = dateObj.getFullYear(),
      m = dateObj.getMonth() + 1,
      d = dateObj.getDay(),
      date = y
      + '-' +
      (m < 10 ? '0' + m : m)
      + '-' +
      (d < 10 ? '0' + d : d)
  return date;
}

module.exports = {
  formatTime,
  getDate
}
