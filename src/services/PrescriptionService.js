import PrescriptionRepository from "../repositories/PrescriptionRepository.js";
import PDFDocument from "pdfkit";
import AppointmentService from "./AppointmentService.js";
import PatientService from "./PacientService.js";
import DoctorService from "./DoctorService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PRESCRIPTIONS_DIR = path.resolve(__dirname, "../prescriptions");

const getAllPrescriptions = async () => {
    return await PrescriptionRepository.getAllPrescriptions();
};

const getPrescription = async (id) => {
    return await PrescriptionRepository.getPrescription(id);
};

const savePrescription = async ({ date, appointmentId, medicine, dosage, instructions }) => {
    return await PrescriptionRepository.savePrescription({ date, appointmentId, medicine, dosage, instructions });
};

const updatePrescription = async (id, { date, appointmentId, medicine, dosage, instructions, file }) => {
    return await PrescriptionRepository.updatePrescription(id, { date, appointmentId, medicine, dosage, instructions, file });
};

const deletePrescription = async (id) => {
    return await PrescriptionRepository.deletePrescription(id);
};

const formatDatePtBr = (value) => {
    const parsed = value ? new Date(value) : new Date();
    if (Number.isNaN(parsed.getTime())) return new Date().toLocaleDateString("pt-BR");
    return parsed.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

const generatePrescriptionFile = async (prescription) => {
    if (!prescription) {
        throw new Error("Prescrição não encontrada");
    }

    if (!mongoose.Types.ObjectId.isValid(prescription.appointmentId)) {
        throw new Error(`appointmentId inválido: "${prescription.appointmentId}". Deve ser um ObjectId válido.`);
    }

    const appointment = await AppointmentService.getAppointment(prescription.appointmentId);
    if (!appointment) throw new Error("Consulta (Appointment) não encontrada");

    const patient = await PatientService.getPacient(appointment.pacientId);
    if (!patient) throw new Error("Paciente não encontrado");

    const doctor = await DoctorService.getDoctor(appointment.doctorId);
    if (!doctor) throw new Error("Médico não encontrado");

    fs.mkdirSync(PRESCRIPTIONS_DIR, { recursive: true });

    const id = prescription._id.toString();
    const fileName = `prescription-${id}.pdf`;
    const absoluteFilePath = path.join(PRESCRIPTIONS_DIR, fileName);
    const relativeFilePath = `prescriptions/${fileName}`;

    await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(absoluteFilePath);

        stream.on("finish", resolve);
        stream.on("error", reject);
        doc.on("error", reject);

        doc.pipe(stream);

        // Cabeçalho institucional
        doc.rect(50, 45, 495, 68).fill("#0f766e");
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("MediApp", 70, 60);
        doc.font("Helvetica").fontSize(10).text("Receituário Médico Digital", 70, 86);
        doc.fontSize(10).text(`Emissão: ${formatDatePtBr(prescription.date || new Date())}`, 380, 72, {
            width: 145,
            align: "right"
        });

        // Dados do médico e paciente
        doc.fillColor("#0f172a").moveDown(3);
        let y = 135;

        doc.rect(50, y, 238, 80).strokeColor("#cbd5e1").lineWidth(1).stroke();
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f766e").text("MÉDICO RESPONSÁVEL", 62, y + 10);
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(doctor.name || "-", 62, y + 26, { width: 215 });
        doc.font("Helvetica").fontSize(9.5).fillColor("#475569")
            .text(`${doctor.medicalSpecialty || "Clínica Geral"}`, 62, y + 43, { width: 215 })
            .text(`Registro: ${doctor.medicalRegistration || "-"}`, 62, y + 57, { width: 215 });

        doc.rect(307, y, 238, 80).strokeColor("#cbd5e1").lineWidth(1).stroke();
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f766e").text("PACIENTE", 319, y + 10);
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(patient.name || "-", 319, y + 26, { width: 215 });
        doc.font("Helvetica").fontSize(9.5).fillColor("#475569")
            .text(`E-mail: ${patient.email || "-"}`, 319, y + 43, { width: 215 })
            .text(`Telefone: ${patient.phone || "-"}`, 319, y + 57, { width: 215 });

        // Prescrição
        y = 240;
        doc.font("Helvetica-Bold").fontSize(13).fillColor("#0f172a").text("Prescrição Médica", 50, y);
        doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor("#0f766e").lineWidth(1.5).stroke();

        y += 35;
        doc.rect(50, y, 495, 190).fillAndStroke("#f8fafc", "#e2e8f0");

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f766e").text("MEDICAMENTO", 68, y + 18);
        doc.font("Helvetica-Bold").fontSize(13).fillColor("#0f172a").text(prescription.medicine || "-", 68, y + 34, { width: 460 });

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f766e").text("POSOLOGIA / DOSAGEM", 68, y + 70);
        doc.font("Helvetica").fontSize(11).fillColor("#1e293b").text(prescription.dosage || "-", 68, y + 86, { width: 460 });

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f766e").text("INSTRUÇÕES DE USO", 68, y + 122);
        doc.font("Helvetica").fontSize(10.5).fillColor("#334155").text(
            prescription.instructions || "Seguir orientação médica.",
            68,
            y + 138,
            { width: 460 }
        );

        // Rodapé e assinatura
        doc.moveTo(185, 680).lineTo(410, 680).strokeColor("#334155").lineWidth(1).stroke();
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(doctor.name || "", 150, 690, {
            width: 295,
            align: "center"
        });
        doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(
            `${doctor.medicalSpecialty || ""} • ${doctor.medicalRegistration || ""}`,
            150,
            704,
            { width: 295, align: "center" }
        );

        doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(
            `Documento gerado eletronicamente pelo MediApp • Código da Receita: ${id}`,
            50,
            760,
            { width: 495, align: "center" }
        );

        doc.end();
    });

    const updatedPrescription = await updatePrescription(id, { file: relativeFilePath });
    return updatedPrescription;
};

const prescriptionService = {
    getAllPrescriptions,
    getPrescription,
    savePrescription,
    updatePrescription,
    deletePrescription,
    generatePrescriptionFile
};

export default prescriptionService;
