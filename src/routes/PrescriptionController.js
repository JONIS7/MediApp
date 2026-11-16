import express from "express";
import PrescriptionService, { PRESCRIPTIONS_DIR } from "../services/PrescriptionService.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_ROOT = path.resolve(__dirname, "..");

let router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(PRESCRIPTIONS_DIR, { recursive: true });
        cb(null, PRESCRIPTIONS_DIR);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({ storage });

router.post("/uploadPrescription/:id", upload.single("file"), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const existing = await PrescriptionService.getPrescription(id);
        if (!existing) {
            return res.status(404).json({ error: "Prescrição não encontrada" });
        }

        const file = `prescriptions/${req.file.filename}`;
        const prescription = await PrescriptionService.updatePrescription(id, { file });
        res.status(200).json(prescription);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao fazer upload da prescrição" });
    }
});

router.get("/readPrescription/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const prescription = await PrescriptionService.getPrescription(id);
        if (!prescription || !prescription.file) {
            return res.status(404).json({ error: "Arquivo de prescrição não encontrado" });
        }

        const cleanRelPath = prescription.file
            .replace(/^\.?\/?MediApp\//, "")
            .replace(/^\.MediApp\//, "")
            .replace(/^\/+/, "");

        const candidates = [
            path.resolve(SRC_ROOT, cleanRelPath),
            path.resolve(PRESCRIPTIONS_DIR, path.basename(cleanRelPath))
        ];

        const filePath = candidates.find((candidate) => fs.existsSync(candidate));
        if (!filePath) {
            return res.status(404).json({ error: "Arquivo PDF não localizado no servidor" });
        }

        res.status(200).sendFile(filePath);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao ler arquivo de prescrição" });
    }
});

router.get("/prescriptions", async (req, res) => {
    try {
        const prescriptions = await PrescriptionService.getAllPrescriptions();
        res.json(prescriptions);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao listar prescrições" });
    }
});

router.get("/prescriptions/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const prescription = await PrescriptionService.getPrescription(id);
        if (!prescription) {
            return res.status(404).json({ error: "Prescrição não encontrada" });
        }
        res.json(prescription);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao buscar prescrição" });
    }
});

router.post("/postPrescription", async function (req, res) {
    const { date, appointmentId, medicine, dosage, instructions } = req.body;
    try {
        const prescription = await PrescriptionService.savePrescription({
            date,
            appointmentId,
            medicine,
            dosage,
            instructions
        });
        res.status(201).json(prescription);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao cadastrar prescrição" });
    }
});

router.put("/prescriptions/:id", async (req, res) => {
    const { id } = req.params;
    const { date, appointmentId, medicine, dosage, instructions } = req.body;
    try {
        const prescription = await PrescriptionService.updatePrescription(id, {
            date,
            appointmentId,
            medicine,
            dosage,
            instructions
        });
        if (!prescription) {
            return res.status(404).json({ error: "Prescrição não encontrada" });
        }
        res.json(prescription);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao atualizar prescrição" });
    }
});

router.delete("/prescriptions/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const prescription = await PrescriptionService.deletePrescription(id);
        if (!prescription) {
            return res.status(404).json({ error: "Prescrição não encontrada" });
        }
        res.json(prescription);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao excluir prescrição" });
    }
});

router.get("/generatePrescriptions/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const prescription = await PrescriptionService.getPrescription(id);
        if (!prescription) {
            return res.status(404).json({ error: "Prescrição não encontrada" });
        }
        const updated = await PrescriptionService.generatePrescriptionFile(prescription);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao gerar PDF da prescrição" });
    }
});

export default router;
