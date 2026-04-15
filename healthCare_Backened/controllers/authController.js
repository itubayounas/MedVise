import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    let { name, email, password, role, specialty, bio, experience, price, phone, address, availability, gender, dateOfBirth, bloodGroup, allergies } = req.body;

    // Sanitize
    email = email?.trim().toLowerCase();
    name  = name?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const safeRole = ["patient","doctor"].includes(role) ? role : "patient";

    // Explicit duplicate check with sanitized email
    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(400).json({ message: `The email "${email}" is already registered. Please log in or use a different email.` });
    }

    const userData = { name, email, password, role: safeRole, phone: phone?.trim(), address: address?.trim(), gender };

    if (safeRole === "doctor") {
      Object.assign(userData, {
        specialty:    specialty || "",
        bio:          bio || "",
        experience:   Number(experience) || 0,
        price:        Number(price) || 0,
        availability: Array.isArray(availability) ? availability : [],
      });
    }

    if (safeRole === "patient") {
      Object.assign(userData, { dateOfBirth: dateOfBirth || null, bloodGroup: bloodGroup || "", allergies: allergies || "" });
    }

    const user = await User.create(userData);
    console.log(`✅ Registered: ${email} as ${safeRole}`);
    res.status(201).json({ success: true, role: user.role });

  } catch (err) {
    console.error("Register error:", err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "email";
      return res.status(400).json({ message: `This ${field} is already registered. Please use a different one.` });
    }
    res.status(500).json({ message: "Server error during registration: " + err.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    if (user.role === "doctor" && !user.isApproved) {
      return res.status(403).json({ message: "Your doctor account is awaiting admin approval. Please check back later." });
    }

    const token = createToken(user._id, user.role);
    res.json({ token, role: user.role, name: user.name, id: user._id });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ["name","phone","address","bio","specialty","experience","price","availability","gender","dateOfBirth","bloodGroup","allergies"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile: " + err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};