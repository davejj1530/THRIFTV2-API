const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth');
module.exports.handleRegistration = async (params) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      balance,
      currency,
      transactions,
    } = params;
    const salt = await bcrypt.genSalt();
    const securedPassword = await bcrypt.hash(password, salt);
    const existingUser = await User.findOne({ email: email });
    if (existingUser !== null) {
      return { success: false, data: 'email already exists' };
    } else {
      const registerUser = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: securedPassword,
        transactions,
        balance,
        currency,
      });
      return {
        success: true,
        accessToken: auth.createAccessToken(registerUser.toObject()),
      };
    }
  } catch (error) {
    return error;
  }
};

module.exports.handleLogin = async (params) => {
  try {
    const { email, password } = params;

    const verifiedUser = await User.findOne({ email: email });

    if (verifiedUser) {
      const match = await bcrypt.compare(password, verifiedUser.password);
      if (match) {
        return {
          success: true,
          createAccessToken: auth.createAccessToken(verifiedUser.toObject()),
        };
      } else {
        return {
          success: false,
          data: 'invalid user credentials',
        };
      }
    } else {
      return {
        success: false,
        data: 'invalid user credentials',
      };
    }
  } catch (error) {
    return error;
  }
};

module.exports.getUserDetails = async (params) => {
  try {
    const userDetails = await User.findOne({ _id: params.id });

    if (userDetails !== null) {
      return userDetails;
    } else {
      return 'Network Error';
    }
  } catch (error) {
    return error;
  }
};
