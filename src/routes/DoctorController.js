import express from "express";
import bcrypt from "bcrypt";
import DoctorService from "../services/DoctorService.js";

let router = express.Router();

router.get("/doctors", async (req, res) => {
    try {
        const doctors = await DoctorService.getAllDoctors();
        res.json(doctors);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao listar médicos" });
    }
});

router.get("/doctors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await DoctorService.getDoctor(id);
        if (!doctor) {
            return res.status(404).json({ error: "Médico não encontrado" });
        }
        res.json(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao buscar médico" });
    }
});

router.post("/postDoctor", async function (req, res) {
    const { name, login, password, medicalSpecialty, medicalRegistration, email, phone } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ error: "Senha é obrigatória" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const doctor = await DoctorService.saveDoctor({
            name,
            login,
            password: hashedPassword,
            medicalSpecialty,
            medicalRegistration,
            email,
            phone
        });
        res.status(201).json(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao cadastrar médico" });
    }
});

router.put("/doctors/:id", async (req, res) => {
    const { id } = req.params;
    const { name, login, password, medicalSpecialty, specialization, medicalRegistration, email, phone } = req.body;
    try {
        const doctor = await DoctorService.updateDoctor(id, {
            name,
            login,
            password,
            medicalSpecialty,
            specialization,
            medicalRegistration,
            email,
            phone
        });
        if (!doctor) {
            return res.status(404).json({ error: "Médico não encontrado" });
        }
        res.json(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao atualizar médico" });
    }
});

router.delete("/doctors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await DoctorService.deleteDoctor(id);
        if (!doctor) {
            return res.status(404).json({ error: "Médico não encontrado" });
        }
        res.json(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao excluir médico" });
    }
});

export default router;
