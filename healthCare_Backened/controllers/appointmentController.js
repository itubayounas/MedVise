import Appointment from "../models/Appointment.js";

// Check if a slot conflicts (within 30 min window)
const hasConflict = async (doctorId, date, excludeId = null) => {
  const d     = new Date(date);
  const start = new Date(d.getTime() - 29 * 60 * 1000);
  const end   = new Date(d.getTime() + 29 * 60 * 1000);

  const query = {
    doctor: doctorId,
    status: { $in: ["Pending", "Approved"] },
    appointmentDate: { $gte: start, $lte: end },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await Appointment.findOne(query);
  return conflict;
};

export const createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, reason } = req.body;

    if (!doctor || !appointmentDate) {
      return res.status(400).json({ message: "Doctor and appointment date are required." });
    }

    // Prevent past dates
    if (new Date(appointmentDate) < new Date()) {
      return res.status(400).json({ message: "Appointment date must be in the future." });
    }

    // Check slot conflict
    const conflict = await hasConflict(doctor, appointmentDate);
    if (conflict) {
      return res.status(409).json({
        message: "This time slot is already booked. Please choose a different time (at least 30 minutes apart).",
        conflictTime: conflict.appointmentDate,
      });
    }

    // Check patient doesn't already have pending/approved with same doctor same day
    const sameDayStart = new Date(appointmentDate);
    sameDayStart.setHours(0,0,0,0);
    const sameDayEnd = new Date(appointmentDate);
    sameDayEnd.setHours(23,59,59,999);

    const patientConflict = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      status: { $in: ["Pending","Approved"] },
      appointmentDate: { $gte: sameDayStart, $lte: sameDayEnd },
    });
    if (patientConflict) {
      return res.status(409).json({ message: "You already have an appointment with this doctor on this day." });
    }

    const appt = await Appointment.create({ patient: req.user._id, doctor, appointmentDate, reason });
    const populated = await appt.populate("doctor", "name email specialty price");
    res.status(201).json(populated);

  } catch (err) {
    console.error("createAppointment error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "name email specialty price phone address availability")
      .sort({ appointmentDate: -1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const filter = { doctor: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const appts = await Appointment.find(filter)
      .populate("patient", "name email phone gender bloodGroup dateOfBirth")
      .sort({ appointmentDate: 1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: "Pending" },
      { status: "Approved" }, { new: true }
    ).populate("patient", "name email");
    if (!appt) return res.status(404).json({ message: "Appointment not found or already processed." });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: "Pending" },
      { status: "Rejected" }, { new: true }
    ).populate("patient", "name email");
    if (!appt) return res.status(404).json({ message: "Appointment not found or already processed." });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Get booked slots for a specific doctor (public - for booking UI)
export const getDoctorBookedSlots = async (req, res) => {
  try {
    const slots = await Appointment.find({
      doctor: req.params.id,
      status: { $in: ["Pending","Approved"] },
      appointmentDate: { $gte: new Date() },
    }).select("appointmentDate status -_id");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};