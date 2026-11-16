/**
 * Seed de teste: cria paciente -> appointment -> prescrição com IDs válidos
 * para testar as funcionalidades de upload e geração de PDF.
 *
 * Uso: node seed-prescription.js
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MONGODB_URI } from "./config/env.js";
import localStore from "./database/localStore.js";

if (!MONGODB_URI) {
    console.log("MONGODB_URI não configurada. A base local já inclui dados completos de demonstração.");
    await localStore.init();
    process.exit(0);
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
console.log("Conectado ao banco!\n");

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", new mongoose.Schema({}, { strict: false }));
const Pacient = mongoose.models.Pacient || mongoose.model("Pacient", new mongoose.Schema({}, { strict: false }));
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", new mongoose.Schema({}, { strict: false }));
const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", new mongoose.Schema({}, { strict: false }));

const doctor = await Doctor.findOne({ login: "admin" });
if (!doctor) {
    console.error("Médico 'admin' não encontrado. Rode primeiro: node seed.js");
    process.exit(1);
}
console.log(`Médico encontrado: ${doctor.name} (ID: ${doctor._id})`);

await Pacient.deleteOne({ login: "paciente_teste" });
const senhaHash = await bcrypt.hash("paciente123", 10);
const pacient = await Pacient.create({
    name: "João da Silva (Teste)",
    login: "paciente_teste",
    password: senhaHash,
    email: "joao.teste@mediapp.com",
    phone: "11 91111-2222",
});
console.log(`Paciente criado: ${pacient.name} (ID: ${pacient._id})`);

await Appointment.deleteOne({ doctorId: doctor._id.toString(), pacientId: pacient._id.toString() });
const appointment = await Appointment.create({
    date: new Date(),
    doctorId: doctor._id.toString(),
    pacientId: pacient._id.toString(),
});
console.log(`Appointment criado (ID: ${appointment._id})`);

await Prescription.deleteOne({ appointmentId: appointment._id.toString() });
const prescription = await Prescription.create({
    date: new Date(),
    appointmentId: appointment._id.toString(),
    medicine: "Amoxicilina 500mg",
    dosage: "1 cápsula a cada 8 horas",
    instructions: "Tomar após as refeições por 7 dias",
});
console.log(`Prescrição criada (ID: ${prescription._id})`);

await mongoose.disconnect();
