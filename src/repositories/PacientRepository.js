import { Pacient } from '../models/Pacient.js';
import { isMongoConnected } from '../database/database.js';
import localStore from '../database/localStore.js';

const filterDefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const getAllPacients = async () => {
    if (!isMongoConnected()) return await localStore.getAllPacients();
    return await Pacient.find();
};

const getPacient = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.getPacient(id);
        return await Pacient.findById(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const savePacient = async ({ name, login, password, email, phone }) => {
    try {
        if (!isMongoConnected()) {
            return await localStore.savePacient({ name, login, password, email, phone });
        }
        const pacient = new Pacient({ name, login, password, email, phone });
        return await pacient.save();
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const updatePacient = async (id, { name, login, password, email, phone }) => {
    try {
        const updates = filterDefined({ name, login, password, email, phone });
        if (!isMongoConnected()) {
            return await localStore.updatePacient(id, updates);
        }
        return await Pacient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const deletePacient = async (id) => {
    try {
        if (!isMongoConnected()) return await localStore.deletePacient(id);
        return await Pacient.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error.message || String(error));
    }
};

const pacientRepository = {
    getAllPacients,
    getPacient,
    savePacient,
    updatePacient,
    deletePacient
};

export default pacientRepository;
