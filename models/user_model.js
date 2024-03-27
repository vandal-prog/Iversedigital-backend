import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
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
