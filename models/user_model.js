import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        unique: true
    },
    phone_number: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    sex:{
        type: String,
        required: false,
        enum:[ 'male', 'female', 'do_not_specify' ]
    },
    profile_img: {
        type: String,
        required: false,
    },
    role:{
        type: String,
        required: true,
        enum:[ 'user', 'admin', 'marchant', 'rider' ]
    },
    isVerified:{
        type: Boolean,
        required: true,
    },
    otp: {
        type: String,
        required: false
    }
},{
    timestamps: true
})

const User = mongoose.model('User', UserSchema);

export default User;
