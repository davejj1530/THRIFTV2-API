const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./connection.js');
const userRoutes = require('./routes/user');
const moment = require('moment');
const User = require('./models/user');
const nodemailer = require('nodemailer');

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200,
};

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const cron = require('node-cron');

cron.schedule('1 1 6 * * * ', async () => {
  console.log('Job running on node-cron');
  let mustBeEmailed = [];
  const users = await User.find();

  users.forEach((user) => {
    user.transactions.forEach((transaction) => {
      if (
        (!transaction.isDone &&
          moment(transaction.datePosted).utc().format('LL') ==
            moment().utc().add(1, 'days').format('LL')) ||
        moment(transaction.datePosted).utc().format('LL') ==
          moment().utc().add(2, 'days').format('LL')
      ) {
        mustBeEmailed.push({
          email: user.email,
          name: user.firstName,
          transactionName: transaction.description,
          transactionAmount: transaction.amount,
          transactionType: transaction.type,
          transactionDate: moment(transaction.datePosted).utc().format('LL'),
        });
      }
    });
  });

  if (mustBeEmailed.length > 0) {
    mustBeEmailed.forEach((user) => {
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
        subject: 'PENDING TRANSACTION',
        html: `<h1> Hello ${user.name}, you have a pending transaction on thrift!</h1>
        <h3>Description: ${user.transactionName}</h3>
        <h3>Type: ${user.transactionType}</h3>
        <h3>Amount: ${user.transactionAmount}</h3>
        <h3>Date: ${user.transactionDate}</h3>
        `,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
    });
  }
});

connectDB();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('HELLO FROM NODE');
});
app.use('/api/users', cors(corsOptions), userRoutes);

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
