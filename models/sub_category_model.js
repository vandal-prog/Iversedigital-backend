import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({

    subCategory_name: {
        type: String,
        required: true,
        unique: true
    },
    subCategory_img: {
        type: String,
        required: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        unique: false,
        required: true
    }
},{
    timestamps: true
})

const subCategory = mongoose.model('subCategory', subCategorySchema);

export default subCategory;
