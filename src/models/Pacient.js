import mongoose from "mongoose";

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    login: {
        type: String,
        required: [true, 'login is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'phone is required'],
        validate:{
            validator: function (v) {
                return /\d{2} 9\d{4}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
})

const Pacient = mongoose.model('Pacient', patientSchema);
export { Pacient };
export default Pacient;
