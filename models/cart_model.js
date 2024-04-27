import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    products:{
        type:Array,
        required:true
    },
    total:{
        type: Number,
        required:false,
    },
},{
    timestamps: true
})

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
