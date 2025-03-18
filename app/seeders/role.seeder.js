const Role = require("../models/roles.model");
const { ROLE } = require("../utils/constant");

/**
 * Role seeder.
 */
module.exports = roleSeeder = async () => {
  try {
    const roleLength = Object.keys(ROLE).length;
    for (let z = 0; z < roleLength; z++) {
      const alreadyExist = await Role.findOne({ role: Object.values(ROLE)[z] });
      if (!alreadyExist) await Role.create({ role: Object.values(ROLE)[z] });
    }
    console.log("✅ Role seeder run successfully...");
  } catch (error) {
    console.log("❌ Error from role seeder :", error);
  }
};
