import mongoose from 'mongoose';

const OffersSchema = new mongoose.Schema({

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
    proposed_price: {
        type: Number,
        required: true,
        unique: false
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: true
    } 
},{
    timestamps: true
})

const Offers = mongoose.model('Offers', OffersSchema);

export default Offers;
