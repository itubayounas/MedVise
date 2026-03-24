import jwt from "jsonwebtoken";
import User from "../models/User.js";


const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  const user = await User.create(req.body);
  res.json({ success: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  // prevent unapproved doctors from logging in
  if (user.role === "doctor" && !user.isApproved) {
    return res.status(403).json({ message: "Doctor account not approved by admin" });
  }

  const token = createToken(user._id, user.role);

  res.json({ token, role: user.role });
};
