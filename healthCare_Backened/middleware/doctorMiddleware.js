const doctorMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "doctor") return res.status(403).json({ message: "Doctor access required" });
  if (!req.user.isApproved) return res.status(403).json({ message: "Doctor not approved" });
  next();
};

export default doctorMiddleware;
