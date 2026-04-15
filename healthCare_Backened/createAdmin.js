import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

try{
  await mongoose.connect(process.env.MONGO_URI);
  console.log(" Connected to MongoDB");
}
catch (error) {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
}

const { default: User } = await import("./models/User.js");

// const existing = await User.findOne({ email: "admin@medvise.com" });
// if (existing) {
//   console.log("Admin already exists:", existing.email);
//   process.exit(0);
// }

await User.deleteOne({ email: process.env.ADMIN_EMAIL });
await User.create({
  name: "MedVise Admin",
  email: "admin@medvise.com",
  password: process.env.ADMIN_PASSWORD, 
  role: "admin",
  isApproved: true,
});

console.log(" Admin created successfully");

process.exit(0);