import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

try {
    if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(envPath);
    }
} catch {
    // .env é opcional se as variáveis já vierem do ambiente
}

export const PORT = Number(process.env.PORT) || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || "mediapp-secret-key-2026";
export const MONGODB_URI = process.env.MONGODB_URI || "";
