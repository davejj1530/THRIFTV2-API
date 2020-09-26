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

module.exports = router;
