import mongoose from 'mongoose';

const ProductReviewsSchema = new mongoose.Schema({

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
    star_rating:{
        type: Number,
        required:false,
        unique:false
    },
    review: {
        type: String,
        required: false,
        unique: false
    }
},{
    timestamps: true
})

const ProductReviews = mongoose.model('ProductReviews', ProductReviewsSchema);

export default ProductReviews;
