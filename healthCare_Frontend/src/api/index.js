import api from "./axios";

// Auth
export const register = (data)          => api.post("/auth/register", data);
export const login    = (data)          => api.post("/auth/login",    data);

// Journals
export const getJournals   = ()         => api.get("/journals");
export const getJournal    = (id)       => api.get(`/journals/${id}`);
export const createJournal = (data)     => api.post("/journals", data);
export const updateJournal = (id, data) => api.put(`/journals/${id}`, data);
export const deleteJournal = (id)       => api.delete(`/journals/${id}`);

// Patient appointments
export const getPatientAppointments = ()     => api.get("/appointments");
export const createAppointment      = (data) => api.post("/appointments", data);

// Doctor
export const getDoctorAppointments = (status) =>
  api.get("/doctor/appointments", { params: status ? { status } : {} });
export const approveAppointment = (id) => api.put(`/doctor/appointments/${id}/approve`);
export const rejectAppointment  = (id) => api.put(`/doctor/appointments/${id}/reject`);

// Admin
export const getPendingDoctors = ()   => api.get("/admin/pending-doctors");
export const approveDoctor     = (id) => api.put(`/admin/approve/${id}`);
export const getStats          = ()   => api.get("/admin/stats");
export const getAllDoctors      = ()   => api.get("/admin/all-doctors");