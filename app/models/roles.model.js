const mongoose = require("mongoose");
const { ROLE } = require("../utils/constant.js");

const roleSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.AGENCY, ROLE.USER],
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;
