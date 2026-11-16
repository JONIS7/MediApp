import mongoose from "mongoose";

const Schema = mongoose.Schema;

const doctorSchema = new Schema({


    name:{
        type:String,
        required: [true, "Name is required"]
    },
    login:{
        type:String,
        required: [true, "Login ID is required"],
        unique:true
    },
    password:{
        type:String,
        required: [true, "Password is required"]
    },
    medicalSpecialty:{
        type:String,
        required: [true, "Specialty is required"]
    },
    medicalRegistration:{
        type:String,
        required: [true, "Medical Registration Number is required"],
        unique:true
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique:true
    },
    phone:{
        type:String,
        required: [true, "Phone is required"],
        unique:true,
        validate:{
            validator: function (v) {
                return /\d{2} 9\d{4}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    
    
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export { Doctor };
export default Doctor;