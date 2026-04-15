import api from "./axios";
export const getDoctorBookedSlots = (doctorId) => api.get(`/appointments/booked-slots/${doctorId}`);


export const register   = (data) => api.post("/auth/register", data);
export const login      = (data) => api.post("/auth/login",    data);
export const getMe      = ()     => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/profile", data);

export const getJournals   = ()         => api.get("/journals");
export const createJournal = (data)     => api.post("/journals", data);
export const updateJournal = (id, data) => api.put(`/journals/${id}`, data);
export const deleteJournal = (id)       => api.delete(`/journals/${id}`);

export const getPatientAppointments = ()     => api.get("/appointments");
export const createAppointment      = (data) => api.post("/appointments", data);

export const getDoctorAppointments = (status) =>
  api.get("/doctor/appointments", { params: status ? { status } : {} });
export const approveAppointment = (id) => api.put(`/doctor/appointments/${id}/approve`);
export const rejectAppointment  = (id) => api.put(`/doctor/appointments/${id}/reject`);

export const getPendingDoctors = ()   => api.get("/admin/pending-doctors");
export const approveDoctor     = (id) => api.put(`/admin/approve/${id}`);
export const getStats          = ()   => api.get("/admin/stats");
export const getAllDoctors      = ()   => api.get("/admin/all-doctors");
export const getAllUsers        = ()   => api.get("/admin/all-users");
export const rejectDoctor = (id) => api.delete(`/admin/reject/${id}`);