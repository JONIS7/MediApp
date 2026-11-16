import express from "express";
import appointmentService from "../services/AppointmentService.js";

let router = express.Router();

router.get("/appointments", async (req, res) => {
    try {
        const appointments = await appointmentService.getAllAppointments();
        res.json(appointments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao listar consultas" });
    }
});

router.get("/appointments/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await appointmentService.getAppointment(id);
        if (!appointment) {
            return res.status(404).json({ error: "Consulta não encontrada" });
        }
        res.json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao obter consulta" });
    }
});

router.post("/appointments", async (req, res) => {
    const { date, doctorId, pacientId } = req.body;
    try {
        const appointment = await appointmentService.saveAppointment({ date, doctorId, pacientId });
        res.status(201).json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao agendar consulta" });
    }
});

router.put("/appointments/:id", async (req, res) => {
    const { id } = req.params;
    const { date, doctorId, pacientId } = req.body;
    try {
        const appointment = await appointmentService.updateAppointment(id, { date, doctorId, pacientId });
        if (!appointment) {
            return res.status(404).json({ error: "Consulta não encontrada" });
        }
        res.json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao atualizar consulta" });
    }
});

router.delete("/appointments/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await appointmentService.deleteAppointment(id);
        if (!appointment) {
            return res.status(404).json({ error: "Consulta não encontrada" });
        }
        res.json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao excluir consulta" });
    }
});

router.put("/reschedule/:id", async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;
    try {
        const existing = await appointmentService.getAppointment(id);
        if (!existing) {
            return res.status(404).json({ error: "Consulta não encontrada" });
        }
        const appointment = await appointmentService.updateAppointment(id, {
            date,
            doctorId: existing.doctorId,
            pacientId: existing.pacientId
        });
        res.json(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Erro ao reagendar consulta" });
    }
});

export default router;
