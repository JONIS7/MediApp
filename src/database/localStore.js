import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "local-db.json");
const PHONE_REGEX = /\d{2} 9\d{4}-\d{4}/;

const newId = () => new mongoose.Types.ObjectId().toString();

async function createSeedData() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const adminHash = await bcrypt.hash("admin123", 10);
    const doc2Hash = await bcrypt.hash("medico123", 10);
    const patHash = await bcrypt.hash("paciente123", 10);

    const doctor1Id = newId();
    const doctor2Id = newId();
    const pacient1Id = newId();
    const pacient2Id = newId();
    const appointment1Id = newId();
    const appointment2Id = newId();
    const appointment3Id = newId();

    return {
        doctors: [
            {
                _id: doctor1Id,
                name: "Dr. Carlos Mendes",
                login: "admin",
                password: adminHash,
                medicalSpecialty: "Cardiologia",
                medicalRegistration: "CRM-SP 123456",
                email: "carlos.mendes@mediapp.com",
                phone: "11 98765-4321",
                createdAt: now.toISOString(),
            },
            {
                _id: doctor2Id,
                name: "Dra. Ana Beatriz Souza",
                login: "ana.souza",
                password: doc2Hash,
                medicalSpecialty: "Pediatria",
                medicalRegistration: "CRM-SP 654321",
                email: "ana.souza@mediapp.com",
                phone: "11 91234-5678",
                createdAt: now.toISOString(),
            },
        ],
        pacients: [
            {
                _id: pacient1Id,
                name: "João da Silva",
                login: "joao.silva",
                password: patHash,
                email: "joao.silva@email.com",
                phone: "11 99876-5432",
                createdAt: now.toISOString(),
            },
            {
                _id: pacient2Id,
                name: "Maria Oliveira",
                login: "maria.oliveira",
                password: patHash,
                email: "maria.oliveira@email.com",
                phone: "11 98765-1122",
                createdAt: now.toISOString(),
            },
        ],
        appointments: [
            {
                _id: appointment1Id,
                date: yesterday.toISOString(),
                doctorId: doctor1Id,
                pacientId: pacient1Id,
                createdAt: now.toISOString(),
            },
            {
                _id: appointment2Id,
                date: tomorrow.toISOString(),
                doctorId: doctor2Id,
                pacientId: pacient2Id,
                createdAt: now.toISOString(),
            },
            {
                _id: appointment3Id,
                date: inThreeDays.toISOString(),
                doctorId: doctor1Id,
                pacientId: pacient2Id,
                createdAt: now.toISOString(),
            },
        ],
        prescriptions: [
            {
                _id: newId(),
                date: yesterday.toISOString(),
                appointmentId: appointment1Id,
                medicine: "Losartana Potássica 50mg",
                dosage: "1 comprimido a cada 24 horas",
                instructions: "Tomar pela manhã em jejum ou após café leve. Retornar em 30 dias com aferição de PA.",
                createdAt: now.toISOString(),
            },
            {
                _id: newId(),
                date: now.toISOString(),
                appointmentId: appointment2Id,
                medicine: "Amoxicilina 500mg",
                dosage: "1 cápsula a cada 8 horas",
                instructions: "Tomar após as refeições durante 7 dias contínuos.",
                createdAt: now.toISOString(),
            },
        ],
    };
}

let initPromise = null;

async function ensureDbFile() {
    if (fs.existsSync(DB_FILE)) return;
    if (!initPromise) {
        initPromise = (async () => {
            if (!fs.existsSync(DB_FILE)) {
                const seedData = await createSeedData();
                fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), "utf-8");
            }
        })();
    }
    await initPromise;
}

async function readDb() {
    await ensureDbFile();
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
        doctors: parsed.doctors || [],
        pacients: parsed.pacients || [],
        appointments: parsed.appointments || [],
        prescriptions: parsed.prescriptions || [],
    };
}

function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function assertRequired(fields, payload) {
    for (const [key, label] of fields) {
        if (!payload[key] || String(payload[key]).trim() === "") {
            throw new Error(`${label} is required`);
        }
    }
}

function assertPhoneValid(phone) {
    if (!PHONE_REGEX.test(phone)) {
        throw new Error(`${phone} is not a valid phone number (expected format: 11 91234-5678)`);
    }
}

function assertUnique(collection, payload, uniqueFields, ignoreId = null) {
    for (const field of uniqueFields) {
        if (payload[field] === undefined) continue;
        const exists = collection.find(
            (item) => item._id !== ignoreId && item[field] === payload[field]
        );
        if (exists) {
            throw new Error(`Duplicate value for ${field}: ${payload[field]}`);
        }
    }
}

function stripUndefined(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined)
    );
}

const localStore = {
    async init() {
        await ensureDbFile();
    },

    // ── Doctors ───────────────────────────────────────────────
    async getAllDoctors() {
        const db = await readDb();
        return db.doctors;
    },

    async getDoctor(id) {
        const db = await readDb();
        return db.doctors.find((d) => d._id === id) || null;
    },

    async getDoctorByLogin(login) {
        const db = await readDb();
        return db.doctors.find((d) => d.login === login) || null;
    },

    async saveDoctor(payload) {
        const db = await readDb();
        assertRequired(
            [
                ["name", "Name"],
                ["login", "Login ID"],
                ["password", "Password"],
                ["medicalSpecialty", "Specialty"],
                ["medicalRegistration", "Medical Registration Number"],
                ["email", "Email"],
                ["phone", "Phone"],
            ],
            payload
        );
        assertPhoneValid(payload.phone);
        assertUnique(db.doctors, payload, ["login", "medicalRegistration", "email", "phone"]);

        const doctor = {
            _id: newId(),
            name: payload.name,
            login: payload.login,
            password: payload.password,
            medicalSpecialty: payload.medicalSpecialty,
            medicalRegistration: payload.medicalRegistration,
            email: payload.email,
            phone: payload.phone,
            createdAt: new Date().toISOString(),
        };
        db.doctors.push(doctor);
        writeDb(db);
        return doctor;
    },

    async updateDoctor(id, payload) {
        const db = await readDb();
        const index = db.doctors.findIndex((d) => d._id === id);
        if (index === -1) return null;

        const updates = stripUndefined(payload);
        if (updates.phone !== undefined) assertPhoneValid(updates.phone);
        assertUnique(db.doctors, updates, ["login", "medicalRegistration", "email", "phone"], id);

        db.doctors[index] = { ...db.doctors[index], ...updates };
        writeDb(db);
        return db.doctors[index];
    },

    async deleteDoctor(id) {
        const db = await readDb();
        const index = db.doctors.findIndex((d) => d._id === id);
        if (index === -1) return null;
        const [removed] = db.doctors.splice(index, 1);
        writeDb(db);
        return removed;
    },

    // ── Pacients ──────────────────────────────────────────────
    async getAllPacients() {
        const db = await readDb();
        return db.pacients;
    },

    async getPacient(id) {
        const db = await readDb();
        return db.pacients.find((p) => p._id === id) || null;
    },

    async savePacient(payload) {
        const db = await readDb();
        assertRequired(
            [
                ["name", "Name"],
                ["login", "Login"],
                ["password", "Password"],
                ["email", "Email"],
                ["phone", "Phone"],
            ],
            payload
        );
        assertPhoneValid(payload.phone);
        assertUnique(db.pacients, payload, ["login", "email"]);

        const pacient = {
            _id: newId(),
            name: payload.name,
            login: payload.login,
            password: payload.password,
            email: payload.email,
            phone: payload.phone,
            createdAt: new Date().toISOString(),
        };
        db.pacients.push(pacient);
        writeDb(db);
        return pacient;
    },

    async updatePacient(id, payload) {
        const db = await readDb();
        const index = db.pacients.findIndex((p) => p._id === id);
        if (index === -1) return null;

        const updates = stripUndefined(payload);
        if (updates.phone !== undefined) assertPhoneValid(updates.phone);
        assertUnique(db.pacients, updates, ["login", "email"], id);

        db.pacients[index] = { ...db.pacients[index], ...updates };
        writeDb(db);
        return db.pacients[index];
    },

    async deletePacient(id) {
        const db = await readDb();
        const index = db.pacients.findIndex((p) => p._id === id);
        if (index === -1) return null;
        const [removed] = db.pacients.splice(index, 1);
        writeDb(db);
        return removed;
    },

    // ── Appointments ──────────────────────────────────────────
    async getAllAppointments() {
        const db = await readDb();
        return db.appointments;
    },

    async getAppointment(id) {
        const db = await readDb();
        return db.appointments.find((a) => a._id === id) || null;
    },

    async saveAppointment(payload) {
        const db = await readDb();
        assertRequired(
            [
                ["date", "Appointment date"],
                ["doctorId", "Doctor"],
                ["pacientId", "Pacient"],
            ],
            payload
        );

        if (!db.doctors.some((d) => d._id === payload.doctorId)) {
            throw new Error(`Doctor ID ${payload.doctorId} does not exist`);
        }
        if (!db.pacients.some((p) => p._id === payload.pacientId)) {
            throw new Error(`Pacient ID ${payload.pacientId} does not exist`);
        }

        const appointment = {
            _id: newId(),
            date: new Date(payload.date).toISOString(),
            doctorId: payload.doctorId,
            pacientId: payload.pacientId,
            createdAt: new Date().toISOString(),
        };
        db.appointments.push(appointment);
        writeDb(db);
        return appointment;
    },

    async updateAppointment(id, payload) {
        const db = await readDb();
        const index = db.appointments.findIndex((a) => a._id === id);
        if (index === -1) return null;

        const updates = stripUndefined(payload);
        if (updates.doctorId && !db.doctors.some((d) => d._id === updates.doctorId)) {
            throw new Error(`Doctor ID ${updates.doctorId} does not exist`);
        }
        if (updates.pacientId && !db.pacients.some((p) => p._id === updates.pacientId)) {
            throw new Error(`Pacient ID ${updates.pacientId} does not exist`);
        }
        if (updates.date) {
            updates.date = new Date(updates.date).toISOString();
        }

        db.appointments[index] = { ...db.appointments[index], ...updates };
        writeDb(db);
        return db.appointments[index];
    },

    async deleteAppointment(id) {
        const db = await readDb();
        const index = db.appointments.findIndex((a) => a._id === id);
        if (index === -1) return null;
        const [removed] = db.appointments.splice(index, 1);
        writeDb(db);
        return removed;
    },

    // ── Prescriptions ─────────────────────────────────────────
    async getAllPrescriptions() {
        const db = await readDb();
        return db.prescriptions;
    },

    async getPrescription(id) {
        const db = await readDb();
        return db.prescriptions.find((p) => p._id === id) || null;
    },

    async savePrescription(payload) {
        const db = await readDb();
        assertRequired(
            [
                ["appointmentId", "Appointment"],
                ["medicine", "Medicine"],
                ["dosage", "Dosage"],
            ],
            payload
        );

        const prescription = {
            _id: newId(),
            date: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString(),
            appointmentId: payload.appointmentId,
            medicine: payload.medicine,
            dosage: payload.dosage,
            instructions: payload.instructions || "",
            createdAt: new Date().toISOString(),
        };
        db.prescriptions.push(prescription);
        writeDb(db);
        return prescription;
    },

    async updatePrescription(id, payload) {
        const db = await readDb();
        const index = db.prescriptions.findIndex((p) => p._id === id);
        if (index === -1) return null;

        const updates = stripUndefined(payload);
        if (updates.date) {
            updates.date = new Date(updates.date).toISOString();
        }

        db.prescriptions[index] = { ...db.prescriptions[index], ...updates };
        writeDb(db);
        return db.prescriptions[index];
    },

    async deletePrescription(id) {
        const db = await readDb();
        const index = db.prescriptions.findIndex((p) => p._id === id);
        if (index === -1) return null;
        const [removed] = db.prescriptions.splice(index, 1);
        writeDb(db);
        return removed;
    },
};

export default localStore;
