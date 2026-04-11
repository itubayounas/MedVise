import User from "../models/User.js";

// list doctors waiting for approval
export const getPendingDoctors = async (req, res) => {
  try {
    const pending = await User.find({ role: "doctor", isApproved: false }).select("name email");
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// approve a doctor
export const approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: "doctor" },
      { isApproved: true },
      { new: true }
    ).select("name email isApproved");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// basic stats: counts of users by role
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const patients = await User.countDocuments({ role: "patient" });
    const doctors = await User.countDocuments({ role: "doctor" });
    const pendingDoctors = await User.countDocuments({ role: "doctor", isApproved: false });
    res.json({ totalUsers, patients, doctors, pendingDoctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all approved doctors (for patient booking dropdown)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", isApproved: true }).select("name email");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (optional, for future use)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role isApproved createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
