const connectDB = require("../models/index");
require("dotenv").config();
// const adminSeeder = require("./admin.seeder");
const roleSeeder = require("./role.seeder");
// const categoriesSeeder = require("./categories.seeder");
// const servicesSeeder = require("./services.seeder");

const mongoose = require("mongoose");
const dbConfig = require("./../config/db.config");


async function seeder() {
  try {
    const db = {};

    mongoose
      .connect(dbConfig.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("✅ MongoDB connected successfully!"))
      .catch((err) => console.error("❌ MongoDB connection error:", err));

    console.log("✅ Seeding database...");

    // await roleSeeder(); // Role seeder.
    // await categoriesSeeder()// Categories seeder.
    // await servicesSeeder()// Services seeder.
    // await adminSeeder(); // Admin seeder.

    console.log("✅ All seeder run successfully...");

    /**
     * To exit with a 'failure' code use: process.exit(1)
     * To exit with a 'success' code use: process.exit(0)
     * Here we have used code 1 because it's process is used only one time when you change in seeder's files.
     */
    process.exit(0);
  } catch (error) {
    console.log("❌ Seeder error: ", error);
    process.exit(1);
  }
}

seeder(); // Seeder calling...
