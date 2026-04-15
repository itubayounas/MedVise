import User from "../models/User.js";

export const getPendingDoctors = async (req, res) => {
  try {
    const pending = await User.find({ role:"doctor", isApproved:false }).select("-password");
    res.json(pending);
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};
//approve doctor by id
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndUpdate(
      { _id:req.params.id, role:"doctor" },
      { isApproved:true }, { new:true }
    ).select("-password");
    if (!doctor) return res.status(404).json({ message:"Doctor not found" });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};
//reject doctor by id
export const rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({
      _id: req.params.id,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getStats = async (req, res) => {
  try {
    const [totalUsers, patients, doctors, pendingDoctors] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role:"patient" }),
      User.countDocuments({ role:"doctor" }),
      User.countDocuments({ role:"doctor", isApproved:false }),
    ]);
    res.json({ totalUsers, patients, doctors, pendingDoctors });
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role:"doctor", isApproved:true })
      .select("-password")
      .sort({ rating:-1 });
    res.json(doctors);
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt:-1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};