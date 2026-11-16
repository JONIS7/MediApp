import { Doctor } from '../models/Doctor.js';
import { isMongoConnected } from '../database/database.js';
import localStore from '../database/localStore.js';

const filterDefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const getAllDoctors = async () => {
    if (!isMongoConnected()) return await localStore.getAllDoctors();
    return await Doctor.find();
};

const getDoctor = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.getDoctor(id);
        return await Doctor.findById(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const saveDoctor = async ({ name, login, password, medicalSpecialty, medicalRegistration, email, phone }) => {
    try {
        if (!isMongoConnected()) {
            return await localStore.saveDoctor({ name, login, password, medicalSpecialty, medicalRegistration, email, phone });
        }
        const doctor = new Doctor({ name, login, password, medicalSpecialty, medicalRegistration, email, phone });
        return await doctor.save();
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const updateDoctor = async (id, { name, login, password, medicalSpecialty, medicalRegistration, email, phone }) => {
    try {
        const updates = filterDefined({ name, login, password, medicalSpecialty, medicalRegistration, email, phone });
        if (!isMongoConnected()) {
            return await localStore.updateDoctor(id, updates);
        }
        return await Doctor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const deleteDoctor = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.deleteDoctor(id);
        return await Doctor.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const getDoctorByLogin = async (login) => {
    try {
        if (!isMongoConnected()) return await localStore.getDoctorByLogin(login);
        return await Doctor.findOne({ login });
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const doctorRepository = {
    getAllDoctors,
    getDoctor,
    saveDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorByLogin
};

export default doctorRepository;
