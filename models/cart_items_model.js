import mongoose from 'mongoose';

const Cart_item_Schema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        unique: true,
        required: false
    },
    quantity:{
        type: Number,
        required:false,
    },
},{
    timestamps: true
})

const Cart_item = mongoose.model('CartItems', Cart_item_Schema);

export default Cart_item;
