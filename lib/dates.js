// Generated by CoffeeScript 1.11.1
module.exports = {
  toYYMMDD: function(date) {
    return "" + (date.getFullYear() % 100) + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
  },
  toHHMM: function(date) {
    return "" + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
  }
};
