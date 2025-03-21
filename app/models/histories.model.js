const mongoose = require("mongoose");

const historiesSchema = mongoose.Schema(
  {
    project_id: {
      type: mongoose.Types.ObjectId, // project owner id
      ref: "users",
    },
    note: {
      type: String,
      trim: true,
      require: true,
    },
    is_delete: { type: Boolean, default: false }, // deleted : 1, note delete: 0
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false }
);

const Role = mongoose.model("histories", historiesSchema);
module.exports = Role;
