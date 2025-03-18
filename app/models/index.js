const mongoose = require("mongoose");
const dbConfig = require("./../config/db.config");

const db = {};

mongoose
  .connect(dbConfig.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import models
db.roles = require("./roles.model")(mongoose);
db.users = require("./users.model")(mongoose);
db.door_keys = require("./door_keys.model")(mongoose);
db.key_assignments = require("./key_assignments.model")(mongoose);

module.exports = db;
