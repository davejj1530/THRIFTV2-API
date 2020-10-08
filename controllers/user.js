const User = require('../models/user');
const Hash = require('../models/hash');
const bcrypt = require('bcrypt');
const auth = require('../auth');
const nodemailer = require('nodemailer');
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
      categories,
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

module.exports.handleChangePassword = async (params) => {
  try {
    const { oldPassword, newPassword, id } = params;

    const user = await User.findOne({ _id: id });

    if (user) {
      const match = await bcrypt.compare(oldPassword, user.password);
      if (match) {
        const salt = await bcrypt.genSalt();
        const securedPassword = await bcrypt.hash(newPassword, salt);
        user.password = securedPassword;
      } else {
        return false;
      }
    } else {
      return false;
    }

    return user.save().then((updated, err) => {
      return err ? false : true;
    });
  } catch (error) {
    return false;
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
    console.log(params.transaction, 'accessing');
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

module.exports.handleUpdate = async (params) => {
  try {
    const user = await User.findByIdAndUpdate(params.id, params.update);

    return user.save().then((updated, err) => {
      return err ? err : true;
    });
  } catch (error) {
    return false;
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
          balance: 0,
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

module.exports.importCategory = async (params) => {
  try {
    const { categoryType, newCategory, id } = params;
    const user = await User.findOne({ _id: id });
    if (user) {
      if (categoryType == 'payment') {
        if (!user.categories.payment.includes(newCategory)) {
          user.categories.payment.unshift(newCategory);
        } else {
          return false;
        }
      } else {
        if (!user.categories.income.includes(newCategory)) {
          user.categories.income.unshift(newCategory);
        } else {
          return false;
        }
      }
    } else {
      return false;
    }

    return user.save().then((updated, err) => {
      return err ? false : updated;
    });
  } catch (error) {
    return false;
  }
};

module.exports.forgotPassword = async (params, origin) => {
  try {
    const user = await User.findOne({ email: params.email });
    const isAlreadyHashed = await Hash.findOne({ email: params.email });

    if (user && !isAlreadyHashed) {
      if (user.loginType != 'google') {
        const key = Math.floor(Math.random() * 1000000);
        const hashedUser = new Hash({
          id: user._id,
          key: key,
          email: params.email,
          createAt: Date.now(),
        });
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        let mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: 'Password Reset',
          html: `<h3> Hello ${user.firstName}, This is your Thrift verification code.</h3>
        <h1>${key}</h1>
        <h3>Go to this <a href=${origin}/forgot-password/${user._id}> website </h3>
        <h3>Please take note that this link will expire in 5 mins!</h3>
        `,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log(info);
          }
        });
        return hashedUser.save().then((updated, err) => {
          return err ? false : true;
        });
      } else {
        return 'google';
      }
    } else if (user && isAlreadyHashed) {
      return 'still';
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

module.exports.checkHashes = async (params) => {
  try {
    const hash = await Hash.findOne({ id: params.id });
    if (hash) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

module.exports.resetPassword = async (params) => {
  try {
    const hash = await Hash.findOne({ id: params.id });

    if (hash) {
      if (hash.key == params.key) {
        const user = await User.findOne({ _id: params.id });
        if (user) {
          const salt = await bcrypt.genSalt();
          const securedPassword = await bcrypt.hash(params.password, salt);
          user.password = securedPassword;

          return user.save().then((updated, err) => {
            return err ? false : true;
          });
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  } catch (err) {
    return false;
  }
};
