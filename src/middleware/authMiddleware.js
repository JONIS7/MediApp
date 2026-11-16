import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

function verifyToken(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.doctorId = decoded.doctorId;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

export default verifyToken;
