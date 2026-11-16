import mongoose from "mongoose";
import Pacient from "./Pacient.js";
import Doctor from "./Doctor.js";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({

    date: {
        type: Date,
        required: [true, "Appointment is required"]
    },

    doctorId: {
        type: String,
        required: [true, "Doctor is required"],
        validate: function (v) {
            const Id = new mongoose.Types.ObjectId(v)
            return Doctor.exists({ _id: Id });
        },
        message: props => `Doctor ID ${props.value} does not exist`
    },

    pacientId: {
        type: String,
        required: [true, "Pacient is required"],
        validate: function (v) {
            const Id = new mongoose.Types.ObjectId(v)
            return Pacient.exists({ _id: Id });
        },
        message: props => `Pacient ID ${props.value} does not exist`
    },

    createdAt: {
        type: Date,
        default: Date.now
    },


});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export { Appointment };
export default Appointment;