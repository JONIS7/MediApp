import express from "express";
import bcrypt from "bcrypt";
import PacientService from "../services/PacientService.js";

let router = express.Router();

router.get("/pacients", async (req, res) => {
    try {
        const pacients = await PacientService.getAllPacients();
        res.json(pacients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao listar pacientes" });
    }
});

router.get("/pacients/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pacient = await PacientService.getPacient(id);
        if (!pacient) {
            return res.status(404).json({ error: "Paciente não encontrado" });
        }
        res.json(pacient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao buscar paciente" });
    }
});

router.post("/postPacient", async function (req, res) {
    const { name, login, password, email, phone } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ error: "Senha é obrigatória" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const pacient = await PacientService.savePacient({
            name,
            login,
            password: hashedPassword,
            email,
            phone
        });
        res.status(201).json(pacient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao cadastrar paciente" });
    }
});

router.put("/pacients/:id", async (req, res) => {
    const { id } = req.params;
    const { name, login, password, email, phone } = req.body;
    try {
        const pacient = await PacientService.updatePacient(id, {
            name,
            login,
            password,
            email,
            phone
        });
        if (!pacient) {
            return res.status(404).json({ error: "Paciente não encontrado" });
        }
        res.json(pacient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao atualizar paciente" });
    }
});

router.delete("/pacients/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pacient = await PacientService.deletePacient(id);
        if (!pacient) {
            return res.status(404).json({ error: "Paciente não encontrado" });
        }
        res.json(pacient);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao excluir paciente" });
    }
});

export default router;
