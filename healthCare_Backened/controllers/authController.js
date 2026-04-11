import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent someone registering as admin via API
    const safeRole = ["patient", "doctor"].includes(role) ? role : "patient";

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }

    const user = await User.create({ name, email, password, role: safeRole });
    res.status(201).json({ success: true, role: user.role });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    if (user.role === "doctor" && !user.isApproved) {
      return res.status(403).json({ message: "Your doctor account is pending admin approval" });
    }

    const token = createToken(user._id, user.role);
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};