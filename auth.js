const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports.createAccessToken = (user) => {
  const data = {
    id: user._id,
    isAdmin: user.isAdmin,
  };

  //generate JWT using passed in data to form the payload signed by the secret string
  return jwt.sign(data, secret, { expiresIn: '6h' });
};

//used as middleware to verify JWT of request
module.exports.verify = (req, res, next) => {
  //obtain token from request authorization header
  let token = req.headers.authorization;

  if (typeof token !== 'undefined') {
    //extract token, removing the "Bearer " prefix
    token = token.slice(7, token.length);

    //verify extracted token against secret used to sign it
    return jwt.verify(token, secret, (err, data) => {
      //if err generated, send an object response with property auth with value ''failed
      //otherwise, proceed to next function
      return err ? res.send({ auth: 'failed' }) : next();
    });
  } else {
    //no token from request header
    return res.send({ auth: 'failed' });
  }
};

module.exports.decode = (token) => {
  if (typeof token !== 'undefined') {
    token = token.slice(7, token.length);

    return jwt.verify(token, secret, (err, data) => {
      return err ? null : jwt.decode(token, { complete: true }).payload;
    });
  } else {
    return null;
  }
};
