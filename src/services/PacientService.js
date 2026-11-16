import bcrypt from "bcrypt";
import PacientRepository from "../repositories/PacientRepository.js";

const getAllPacients = async () => {
    return await PacientRepository.getAllPacients();
};

const getPacient = async (id) => {
    return await PacientRepository.getPacient(id);
};

const savePacient = async ({ name, login, password, email, phone }) => {
    return await PacientRepository.savePacient({ name, login, password, email, phone });
};

const updatePacient = async (id, { name, login, password, email, phone }) => {
    let hashedPassword;
    if (password && String(password).trim() !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    return await PacientRepository.updatePacient(id, {
        name,
        login,
        password: hashedPassword,
        email,
        phone
    });
};

const deletePacient = async (id) => {
    return await PacientRepository.deletePacient(id);
};

const patientService = {
    getAllPacients,
    getPacient,
    savePacient,
    updatePacient,
    deletePacient
};

export default patientService;
