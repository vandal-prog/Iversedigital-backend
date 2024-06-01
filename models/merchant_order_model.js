import mongoose from 'mongoose';

const merchantOrdersSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: false
    },
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Store',
        unique: false,
        required: false
    },
    order_code:{
        type: String,
        required:false,
    },
    product:{
        type: Object,
        required:false,
    },
    quantity: {
        type: Number,
        required: false
    },
    order_status:{
        type: String,
        required: false,
        enum:[ 'Pending', 'Created', 'Delivered', 'In-transit' ]
    },
    customer:{
        type: Object,
        required: false
    }

},{
    timestamps: true
})

const merchantOrders = mongoose.model('merchantOrders', merchantOrdersSchema);

export default merchantOrders;
