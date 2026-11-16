import express from "express";
import router from "./routes/router.js";
import "./database/database.js";
import cors from "cors";
import { PORT } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/", router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
