const mongoose = require('mongoose');

const userData = mongoose.Schema({
  username: String,
  
  count: {type:Number, default:0},
  logs: Array
})

module.exports = mongoose.model('user', userData);