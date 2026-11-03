const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("MongoDB Connected Successfully!");
        return mongoose.connection;
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
