import mongoose from "mongoose";
import { MONGODB_URI } from "./config/env.js";

if (!MONGODB_URI) {
    console.log("MONGODB_URI não configurada. Nenhuma limpeza necessária no MongoDB.");
    process.exit(0);
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
console.log("Conectado ao banco!\n");

const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", new mongoose.Schema({}, { strict: false }));

const all = await Prescription.find({});
console.log(`Total de prescrições no banco: ${all.length}`);

const invalidas = all.filter((p) => !mongoose.Types.ObjectId.isValid(p.appointmentId));

if (invalidas.length === 0) {
    console.log("Nenhuma prescrição inválida encontrada.");
} else {
    console.log(`\nPrescrições com appointmentId inválido (${invalidas.length}):`);
    invalidas.forEach((p) => {
        console.log(`  ID: ${p._id} | appointmentId: "${p.appointmentId}"`);
    });

    const ids = invalidas.map((p) => p._id);
    await Prescription.deleteMany({ _id: { $in: ids } });
    console.log(`\n${invalidas.length} prescrição(ões) inválida(s) deletada(s).`);
}

await mongoose.disconnect();
console.log("\nPronto!");
