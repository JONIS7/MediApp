import express from "express";
import appointmentController from "./AppointmentController.js";
import doctorController from "./DoctorController.js";
import patientController from "./PacientController.js";
import prescriptionController from "./PrescriptionController.js";
import DoctorService from "../services/DoctorService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/authMiddleware.js";
import { JWT_SECRET } from "../config/env.js";
import { isMongoConnected } from "../database/database.js";

let router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        app: "MediApp API",
        persistence: isMongoConnected() ? "mongodb" : "local-json"
    });
});

// Autenticação de médicos
router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
        }

        const doctor = await DoctorService.getDoctorByLogin(login);
        if (!doctor) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const passwordMatch = await bcrypt.compare(password, doctor.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const token = jwt.sign({ doctorId: doctor._id }, JWT_SECRET, { expiresIn: "8h" });
        res.status(200).json({
            token,
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                login: doctor.login,
                medicalSpecialty: doctor.medicalSpecialty,
                email: doctor.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Login failed" });
    }
});

router.use("/", verifyToken, appointmentController);
router.use("/", verifyToken, doctorController);
router.use("/", verifyToken, patientController);
router.use("/", verifyToken, prescriptionController);

export default router;
