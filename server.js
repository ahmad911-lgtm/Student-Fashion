const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  return app.listen(PORT, () => {
    console.log(`Student Fashion server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch(error => {
    console.error("MongoDB Connection Failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
