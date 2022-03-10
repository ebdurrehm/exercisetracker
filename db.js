const mongoose = require('mongoose');

const userData = mongoose.Schema({
  username: String,
  
  count: {type:Number, default:0},
  log: [{
    description: String,
    duration: Number,
    date: String
}
  ]
})

module.exports = mongoose.model('user', userData);