import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const { default: User } = await import("./models/User.js");

const existing = await User.findOne({ email: "admin@medvise.com" });
if (existing) {
  console.log("Admin already exists:", existing.email);
  process.exit(0);
}

const hashed = await bcrypt.hash("Admin@1234", 10);
await User.create({
  name:       "MedVise Admin",
  email:      "admin@medvise.com",
  password:   hashed,
  role:       "admin",
  isApproved: true,
});

console.log("✅ Admin created successfully");
console.log("Email:    admin@medvise.com");
console.log("Password: Admin@1234");
process.exit(0);