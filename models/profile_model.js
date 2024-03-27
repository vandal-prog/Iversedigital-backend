import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    }
},{
    timestamps: true
})

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;
