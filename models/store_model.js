import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({

    store_name: {
        type: String,
        required: true,
        unique: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    store_category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        unique: false,
        required: true
    },
    customer_care_number:{
        type: String,
        unique: false,
        required: true
    },
    address: {
        type: String,
        unique: false,
        required: true
    },
    area: {
        type: String,
        unique: false,
        required: true
    },
    state: {
        type: String,
        unique: false,
        required: true
    },
    has_rider: {
        type: Boolean,
        unique: false,
        required: false
    },
    isCAC_verified: {
        type: Boolean,
        unique: false,
        required: true
    },
    CAC_number: {
        type: String,
        unique: false,
        required: false
    },
    is_Opened:{
        type: Boolean,
        unique:false,
        required:false
    },
    is_Available:{
        type: Boolean,
        unique:false,
        required:false
    },
    is_Verified: {
        type: Boolean,
        default: false
    },
    is_Rejected: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const Store = mongoose.model('Store', StoreSchema);

export default Store;
