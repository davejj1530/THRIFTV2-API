const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./connection.js');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

connectDB();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('HELLO FROM NODE');
});
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
