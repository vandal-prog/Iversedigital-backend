import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: false
    },
    bank_name:{
        type: String,
        required: true
    },
    account_number:{
        type: Number,
        required:true,
    },
    account_name: {
        type: String,
        required: true,
    }
},{
    timestamps: true
})

const bankAccount = mongoose.model('bankAccount', bankAccountSchema);

export default bankAccount;
