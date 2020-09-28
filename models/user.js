const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, 'email is required'],
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, 'password required'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    required: [true, ' balance is required'],
  },
  currency: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: '',
  },
  transactions: [
    {
      type: {
        type: String,
        required: [true, 'transaction type required'],
      },
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      datePosted: {
        type: Date,
        default: new Date(),
      },
      isDone: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
