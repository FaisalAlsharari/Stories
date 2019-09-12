const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentedAt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Comment', commentSchema)
