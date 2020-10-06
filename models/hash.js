const mongoose = require('mongoose');

const hashSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'id is required'],
  },
  key: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
    index: { expires: 300 },
  },
});

module.exports = mongoose.model('Hash', hashSchema);
