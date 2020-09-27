const express = require('express');
const router = express.Router();
const auth = require('../auth');
const UserController = require('../controllers/user');
router.get('/', (req, res) => {
  res.send('you are querying from the users routes');
});

router.post('/register', (req, res) => {
  UserController.handleRegistration(req.body).then((data) => {
    res.send(data);
  });
});

router.post('/login', (req, res) => {
  UserController.handleLogin(req.body).then((data) => {
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
    res.send(result);
  });
});

router.put('/:transactionId', auth.verify, (req, res) => {
  const data = {
    userId: auth.decode(req.headers.authorization).id,
    transactionId: req.params.transactionId,
    transactionUpdate: {
      type: 'Income',
      description: 'testing updates',
      amount: 1000,
    },
  };

  UserController.updateTransaction(data).then((result) => {
    res.send(result);
  });
});
router.delete('/:transactionId', auth.verify, (req, res) => {
  const data = {
    userId: auth.decode(req.headers.authorization).id,
    transactionId: req.params.transactionId,
  };

  UserController.deleteTransaction(data).then((result) => {
    res.send(result);
  });
});
module.exports = router;
