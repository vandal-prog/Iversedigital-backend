import mongoose from 'mongoose';

const LikesSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: false
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        unique: false,
        required: true
    }
},{
    timestamps: true
})

const Likes = mongoose.model('Likes', LikesSchema);

export default Likes;
