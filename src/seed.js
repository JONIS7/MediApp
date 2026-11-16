import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MONGODB_URI } from "./config/env.js";
import localStore from "./database/localStore.js";

if (!MONGODB_URI) {
    console.log("MONGODB_URI não configurada. Inicializando base local em src/database/local-db.json...");
    await localStore.init();
    console.log("Base local pronta! Login demo: admin / admin123");
    process.exit(0);
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
console.log("Conectado ao banco!");

const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    name: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    medicalSpecialty: { type: String, required: true },
    medicalRegistration: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

const senhaHash = await bcrypt.hash("admin123", 10);

const medico = {
    name: "Dr. Carlos Mendes",
    login: "admin",
    password: senhaHash,
    medicalSpecialty: "Cardiologia",
    medicalRegistration: "CRM-SP 123456",
    email: "carlos.mendes@mediapp.com",
    phone: "11 98765-4321",
};

try {
    await Doctor.deleteOne({ login: "admin" });

    const doc = await Doctor.create(medico);
    console.log("\nMédico criado com sucesso!");
    console.log("----------------------------");
    console.log("  Login:  admin");
    console.log("  Senha:  admin123");
    console.log("  ID:    ", doc._id.toString());
    console.log("----------------------------\n");
} catch (err) {
    console.error("Erro ao criar médico:", err.message);
}

await mongoose.disconnect();
