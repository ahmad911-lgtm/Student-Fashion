const serverless = require("serverless-http");
const app = require("../../app");
const connectDB = require("../../config/db");

const expressHandler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();
    return await expressHandler(event, context);
  } catch (error) {
    console.error("Netlify API request failed:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "The API could not connect to its database." })
    };
  }
};
