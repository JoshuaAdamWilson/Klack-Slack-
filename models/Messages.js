const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number
  }
})

module.exports = Message = mongoose.model('message', MessageSchema)