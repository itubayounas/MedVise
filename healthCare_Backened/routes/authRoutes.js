import express from "express";
import { login, register } from "../controllers/authController.js";
const authrouter = express.Router();

authrouter.post("/register", register);
authrouter.post("/login", login);

export default authrouter;
