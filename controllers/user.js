const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth');
const { cloudinary } = require('../utils/cloudinary');
const { OAuth2Client } = require('google-auth-library');
const clientId = process.env.CLIENT_ID;
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
      url,
    } = params;
    console.log(password);
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
        url,
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
      return { auth: 'success', ...userDetails };
    } else {
      return { auth: 'failed' };
    }
  } catch (error) {
    return { auth: 'failed' };
  }
};

module.exports.addTransaction = async (params) => {
  try {
    console.log(params.transaction);
    const user = await User.findOne({ _id: params.id });
    if (user != null) {
      user.transactions.unshift(params.transaction);

      if (params.transaction.type == 'payment') {
        user.balance = user.balance - params.transaction.amount;
      } else {
        user.balance += params.transaction.amount;
      }
    } else {
      return false;
    }
    return user.save().then((updated, err) => {
      return err ? err : updated;
    });
  } catch (err) {
    return 'something went wrong';
  }
};

module.exports.updateTransaction = async (params) => {
  try {
    const user = await User.findByIdAndUpdate(params.userId);

    let x = [];
    if (user != null) {
      user.transactions.forEach((transaction, index) => {
        if (transaction._id == params.transactionId) {
          user.transactions[index] = params.transactionUpdate;
        }
      });
    } else {
      return false;
    }

    return user.save().then((updated, err) => {
      return err ? err : updated;
    });
  } catch (error) {
    return error;
  }
};

module.exports.deleteTransaction = async (params) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: params.userId },
      {
        $pull: {
          transactions: { _id: params.transactionId },
        },
      }
    );

    return user.save().then((updated, err) => {
      return err ? err : updated;
    });
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports.upload = async (params) => {
  try {
    const picture = params.picture;

    const uploadedResponse = await cloudinary.uploader.upload(picture);

    return uploadedResponse;
  } catch (error) {
    return false;
  }
};

module.exports.verifyGoogleTokenId = async (params) => {
  const client = new OAuth2Client(clientId);
  const data = await client.verifyIdToken({
    idToken: params,
    audience: clientId,
  });
  console.log(data);
  if (data.payload.email_verified === true) {
    const user = await User.findOne({ email: data.payload.email }).exec();

    if (user !== null) {
      if (user.loginType === 'google') {
        return {
          accessToken: auth.createAccessToken(user.toObject()),
        };
      } else {
        return { error: 'login-type-error' };
      }
    } else {
      const newUser = new User({
        firstName: data.payload.given_name,
        lastName: data.payload.family_name,
        email: data.payload.email,
        password: clientId,
        balance: 0,
        url: data.payload.picture,
        currency: 'PHP',
        transactions: {
          type: 'INVESTMENT',
          description: 'WELCOME TO THRIFT!',
          amount: 0,
        },
        loginType: 'google',
      });

      return newUser.save().then((user, err) => {
        return {
          accessToken: auth.createAccessToken(user.toObject()),
        };
      });
    }
  } else {
    return { error: 'google-auth-error' };
  }
};
