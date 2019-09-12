const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Story', storySchema)
