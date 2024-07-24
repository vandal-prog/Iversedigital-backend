import mongoose from 'mongoose';

const deliveryAddressSchema = new mongoose.Schema({

    from_state:{
        type:String,
        required:false
    },
    from_area:{
        type: String,
        required:false,
    },
    from_street:{
        type: String,
        required:false,
    },
    to_state:{
        type:String,
        required:false
    },
    to_area:{
        type: String,
        required:false,
    },
    to_street:{
        type: String,
        required:false,
    },
    delivery_fee: {
        type: Number,
        required:false,
    }
},{
    timestamps: true
})

const deliveryAddress = mongoose.model('deliveryAddress', deliveryAddressSchema);

export default deliveryAddress;