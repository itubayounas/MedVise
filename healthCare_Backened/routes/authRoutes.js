import express from "express";
import { login, register, updateProfile, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authrouter = express.Router();
authrouter.post("/register", register);
authrouter.post("/login",    login);
authrouter.get("/me",        authMiddleware, getMe);
authrouter.put("/profile",   authMiddleware, updateProfile);

export default authrouter;