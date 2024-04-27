import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({

    product_title: {
        type: String,
        required: true,
        unique: false
    },
    product_price: {
        type: String,
        required: true,
        unique: false 
    },
    product_description: {
        type: String,
        required: true,
        unique: false 
    },
    product_images: {
        type: Array,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: false
    },
    total_bookmarks: {
        type: Number,
        required: true,
        unique: false 
    },
    state: {
        type: String,
        required: true,
        unique: false 
    },
    area: {
        type: String,
        required: true,
        unique: false 
    },
    address: {
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
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        unique: false,
        required: true
    },
    subCategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'subCategory',
        unique: false,
        required: true
    },
    features:{
        type: Object,
        required: true,
    },
    isNegotiable:{
        type: Boolean,
        required: false
    }
},{
    timestamps: true
})

const Product = mongoose.model('Product', ProductSchema);

export default Product;
