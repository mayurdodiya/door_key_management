const mongoose = require("mongoose");
const validator = require("validator");
const { ROLE } = require("../utils/constant.js");

const doorKeySchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    key_name: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    key_number: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    is_occupied: { type: Boolean, default: false, required: true },
    image_url: { type: String, default: null }, // qr image
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("door_keys", doorKeySchema);
