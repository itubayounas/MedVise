import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const timeSlotSchema = new mongoose.Schema({
  day:   { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
  start: { type: String },
  end:   { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ["patient","doctor","admin"], default: "patient" },
  isApproved: { type: Boolean, default: function() { return this.role !== "doctor"; } },

  // Doctor fields
  specialty:    { type: String, default: "" },
  bio:          { type: String, default: "" },
  experience:   { type: Number, default: 0 },
  price:        { type: Number, default: 0 },
  availability: [timeSlotSchema],
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  phone:        { type: String, default: "" },
  address:      { type: String, default: "" },
  gender:       { type: String, enum: ["Male","Female","Other",""], default: "" },

  // Patient fields
  dateOfBirth:  { type: Date },
  bloodGroup:   { type: String, default: "" },
  allergies:    { type: String, default: "" },

}, { timestamps: true });

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);