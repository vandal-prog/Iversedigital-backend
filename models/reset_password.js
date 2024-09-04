import mongoose from 'mongoose';

const ForgetPasswordSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: false,
        required: false
    },
    otp:{
        type: String,
        unique: false,
        required: true
    },
    status:{
        type: String,
        required:false,
        unique:false,
        enum: [ 'Pending', 'Success', 'Failed', 'Created', 'Expired' ]
    }
},{
    timestamps: true
})

const ForgetPassword = mongoose.model('ForgetPassword', ForgetPasswordSchema);

export default ForgetPassword;
