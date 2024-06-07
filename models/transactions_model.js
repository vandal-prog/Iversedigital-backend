import mongoose from 'mongoose';

const TransactionsSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: false
    },
    amount:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required:true,
    },
    transaction_type: {
        type: String,
        enum: [ 'credit', 'debit', 'withdrawal' ],
        required: true,
    },
    balance_before: {
        type: Number,
        unique: false,
        required: true
    },
    balance_after: {
        type: Number,
        unique: false,
        required: true
    },
    transaction_status: {
        type: String,
        enum: [ 'pending', 'failed', 'success' ],
        required: true
    },
    withdrawal_account: {
        type: Object,
        required: false
    }
},{
    timestamps: true
})

const Transactions = mongoose.model('Transactions', TransactionsSchema);

export default Transactions;
