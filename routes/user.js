const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../auth');
const UserController = require('../controllers/user');
router.get('/', (req, res) => {
  res.send('you are querying from the users routes');
});

router.post('/register', (req, res) => {
  UserController.handleRegistration(req.body).then((data) => {
    console.log(data);
    res.send(data);
  });
});

router.post('/login', (req, res) => {
  UserController.handleLogin(req.body).then((data) => {
    res.send(data);
  });
});

router.put('/update-user', auth.verify, (req, res) => {
  const data = {
    id: auth.decode(req.headers.authorization).id,
    update: req.body,
  };
  UserController.handleUpdate(data).then((data) => {
    res.send(data);
  });
});

router.post('/add-category', auth.verify, (req, res) => {
  const data = {
    id: auth.decode(req.headers.authorization).id,
    categoryType: req.body.categoryType,
    newCategory: req.body.newCategory,
  };

  UserController.importCategory(data).then((result) => {
    res.send(result);
  });
});

router.put('/change-password', auth.verify, (req, res) => {
  const data = {
    id: auth.decode(req.headers.authorization).id,
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword,
  };

  UserController.handleChangePassword(data).then((data) => {
    res.send(data);
  });
});

router.get('/userdetails', auth.verify, (req, res) => {
  const user = auth.decode(req.headers.authorization);
  UserController.getUserDetails(user).then((data) => {
    res.status(200).json({
      message: 'details successfully gathered',
      data: data,
    });
  });
});

router.post('/transaction', auth.verify, (req, res) => {
  const data = {
    id: auth.decode(req.headers.authorization).id,
    transaction: req.body,
  };

  UserController.addTransaction(data).then((result) => {
    console.log(result);
    res.send(result);
  });
});

router.put('/transaction/:transactionId', auth.verify, (req, res) => {
  const data = {
    userId: auth.decode(req.headers.authorization).id,
    transactionId: req.params.transactionId,
    transactionUpdate: req.body.transactionUpdate,
  };

  UserController.updateTransaction(data).then((result) => {
    res.send(result);
  });
});
router.delete('/transaction/:transactionId', auth.verify, (req, res) => {
  const data = {
    userId: auth.decode(req.headers.authorization).id,
    transactionId: req.params.transactionId,
  };

  UserController.deleteTransaction(data).then((result) => {
    res.send(result);
  });
});

router.post('/upload', (req, res) => {
  const data = {
    picture: req.body.picture,
  };
  UserController.upload(data).then((result) => {
    res.send(result);
  });
});
module.exports = router;

router.post('/verify-google-id-token', (req, res) => {
  UserController.verifyGoogleTokenId(req.body.tokenId).then((data) => {
    res.send(data);
  });
});

router.post('/forgot-password', (req, res) => {
  UserController.forgotPassword(req.body, req.headers.origin).then((data) => {
    res.send(data);
  });
});

router.post('/check-hashes', (req, res) => {
  UserController.checkHashes(req.body).then((data) => {
    res.send(data);
  });
});

router.put('/reset-password', (req, res) => {
  UserController.resetPassword(req.body).then((data) => {
    res.send(data);
  });
});
