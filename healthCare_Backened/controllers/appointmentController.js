import Appointment from "../models/Appointment.js";

// Patient: create appointment with a doctor
export const createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, reason } = req.body;
    const appt = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate,
      reason
    });
    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Patient: list their appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user._id }).populate("doctor", "name email").sort({ appointmentDate: -1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Doctor: list appointments for this doctor (optionally filter by status)
export const getDoctorAppointments = async (req, res) => {
  try {
    const filter = { doctor: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const appts = await Appointment.find(filter).populate("patient", "name email").sort({ appointmentDate: -1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Doctor: approve an appointment
export const approveAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: "Pending" },
      { status: "Approved" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ message: "Appointment not found or not pending" });
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Doctor: reject an appointment
export const rejectAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: "Pending" },
      { status: "Rejected" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ message: "Appointment not found or not pending" });
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
