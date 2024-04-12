import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    location: {
        type: String,
        required: false,
        unique: false
    },
    birthday: {
        type: String,
        required:false,
        unique: false
    }
},{
    timestamps: true
})

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;
