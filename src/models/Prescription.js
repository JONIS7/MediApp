import mongoose from "mongoose";

const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
    date: {
        type: Date
    },
    appointmentId: {
        type: String,
        required: [true, 'appointment is required']
    },
    medicine: {
        type: String,
        required: [true, 'medicine is required']
    },
    dosage: {
        type: String,
        required: [true, 'dosage is required']
    },
    instructions: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    file:{
        type:String
    },
    
    
})

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export { Prescription };
export default Prescription;