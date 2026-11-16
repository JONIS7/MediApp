import { Prescription } from '../models/Prescription.js';
import { isMongoConnected } from '../database/database.js';
import localStore from '../database/localStore.js';

const filterDefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const getAllPrescriptions = async () => {
    if (!isMongoConnected()) return await localStore.getAllPrescriptions();
    return await Prescription.find();
};

const getPrescription = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.getPrescription(id);
        return await Prescription.findById(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const savePrescription = async ({ date, appointmentId, medicine, dosage, instructions }) => {
    try {
        if (!isMongoConnected()) {
            return await localStore.savePrescription({ date, appointmentId, medicine, dosage, instructions });
        }
        const prescription = new Prescription({ date, appointmentId, medicine, dosage, instructions });
        return await prescription.save();
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const updatePrescription = async (id, { date, appointmentId, medicine, dosage, instructions, file }) => {
    try {
        const updates = filterDefined({ date, appointmentId, medicine, dosage, instructions, file });
        if (!isMongoConnected()) {
            return await localStore.updatePrescription(id, updates);
        }
        return await Prescription.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const deletePrescription = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.deletePrescription(id);
        return await Prescription.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const prescriptionRepository = {
    getAllPrescriptions,
    getPrescription,
    savePrescription,
    updatePrescription,
    deletePrescription
};

export default prescriptionRepository;
