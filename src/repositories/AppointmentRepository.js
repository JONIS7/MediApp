import { Appointment } from '../models/Appointment.js';
import { isMongoConnected } from '../database/database.js';
import localStore from '../database/localStore.js';

const filterDefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const getAllAppointments = async () => {
    if (!isMongoConnected()) return await localStore.getAllAppointments();
    return await Appointment.find();
};

const getAppointment = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.getAppointment(id);
        return await Appointment.findById(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const saveAppointment = async ({ date, doctorId, pacientId }) => {
    try {
        if (!isMongoConnected()) {
            return await localStore.saveAppointment({ date, doctorId, pacientId });
        }
        const appointment = new Appointment({ date, doctorId, pacientId });
        return await appointment.save();
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const updateAppointment = async (id, { date, doctorId, pacientId }) => {
    try {
        const updates = filterDefined({ date, doctorId, pacientId });
        if (!isMongoConnected()) {
            return await localStore.updateAppointment(id, updates);
        }
        return await Appointment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const deleteAppointment = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.deleteAppointment(id);
        return await Appointment.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const appointmentRepository = {
    getAllAppointments,
    getAppointment,
    saveAppointment,
    updateAppointment,
    deleteAppointment
};

export default appointmentRepository;
