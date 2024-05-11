import mongoose from 'mongoose';

const CallbackSchema = new mongoose.Schema({

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
    },
    status:{
        type: String,
        enum:['declined','accepted','pending'],
        required:true,
        unique:false
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: true
    },
    description: {
        type: String,
        required: true,
    }
},{
    timestamps: true
})

const Callback = mongoose.model('Callback', CallbackSchema);

export default Callback;
