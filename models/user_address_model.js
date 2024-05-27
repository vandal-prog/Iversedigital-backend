import mongoose from 'mongoose';

const userAddressSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    state:{
        type:String,
        required:false
    },
    area:{
        type: String,
        required:false,
    },
    address:{
        type: String,
        required:false,
    }
},{
    timestamps: true
})

const userAddress = mongoose.model('userAddress', userAddressSchema);

export default userAddress;
