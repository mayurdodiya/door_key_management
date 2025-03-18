const mongoose = require("mongoose");
const validator = require("validator");

const keyAssignmentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    door_key_id: {
      type: mongoose.Types.ObjectId,
      ref: "door_keys",
      required: true,
    },
    agency_employee: {
      full_name: {
        type: String,
        // required: true,
        trim: true,
        // default: null,
      },
      phone_no: {
        type: String,
        // required: true,
        trim: true,
      },
      profile_image: { type: String, default: null }, // employee photo capture
    },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

module.exports = mongoose.model("key_assignments", keyAssignmentSchema);
