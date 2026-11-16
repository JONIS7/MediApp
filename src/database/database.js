import mongoose from "mongoose";
import { MONGODB_URI } from "../config/env.js";
import localStore from "./localStore.js";

let mongoConnected = false;

export const isMongoConnected = () => mongoConnected;

if (MONGODB_URI && MONGODB_URI.trim() !== "") {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
        mongoConnected = true;
        console.log("Connected to MongoDB");
    } catch (error) {
        mongoConnected = false;
        console.warn(`MongoDB connection unavailable (${error.message}). Switching to local JSON persistence (src/database/local-db.json).`);
        await localStore.init();
    }
} else {
    mongoConnected = false;
    console.log("MONGODB_URI not configured. Using local JSON persistence (src/database/local-db.json).");
    await localStore.init();
}

const db = mongoose.connection;

db.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
});

export default db;
