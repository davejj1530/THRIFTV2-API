const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log(`mongoDB connected : ${connection.connection.host}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
