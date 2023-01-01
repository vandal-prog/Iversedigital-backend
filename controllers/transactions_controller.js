import bankAccount from "../models/bank_account_model.js";
import Transactions from "../models/transactions_model.js";


export const getUserTransactions = async (req,res) => {

    try{

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        const getAlltransactions = await Transactions.find({ user: req.user._id }).populate(populate_options);

        let wallet_balance;

        if ( getAlltransactions.length < 1 ) {
            wallet_balance = 0
        }

        if ( getAlltransactions.length > 0 ) {
            wallet_balance = getAlltransactions[ getAlltransactions.length - 1 ].balance_after
        }

        return res.status(200).json({
            message:"Wallet transaction gotten successfully",
            data: {
                wallet_balance,
                transactions: getAlltransactions
            }
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const getallUserbankaccount = async (req,res) => {

    try{

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        const getUseraccounts = await bankAccount.findOne({ user: req.user._id }).populate(populate_options);

        return res.status(200).json({
            message:"Your bank account was gotten successfully",
            data: getUseraccounts
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const saveUserbank = async (req,res) => {

    try{

        const bank_name = req.body.bank_name
        const account_number = req.body.account_number
        const account_name = req.body.account_name
        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        if ( !bank_name || !account_number || !account_name ) {
            return res.status(400).json({
                message: "bank name, account number and account name are required"
            })
        }

        const getUseraccount = await bankAccount.findOne({ user: req.user._id }).populate(populate_options);

        if ( getUseraccount ) {
            
            getUseraccount.bank_name = bank_name
            getUseraccount.account_name = account_name
            getUseraccount.account_number = account_number

            const savedAccountdetails = await getUseraccount.save();

            return res.status(200).json({
                message:"Your bank account details were saved successfully",
                data: savedAccountdetails
            })

        }

        const newAccount = new bankAccount({
            user: req.user._id,
            bank_name: bank_name,
            account_name: account_name,
            account_number: account_number
        })

        const savedAccount = await newAccount.save()

        return res.status(200).json({
            message:"Your bank account details were saved successfully",
            data: savedAccount
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const withdrawalRequest = async (req,res) => {

    try{

        let withdrawalAmount = req.body.withdrawal_amount

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        if ( !withdrawalAmount ) {
            return res.status(200).json({
                message: 'withdrawal amount is required'
            })
        }

        withdrawalAmount = parseInt(withdrawalAmount,10)

        const bankDetails = await bankAccount.findOne({ user: req.user._id }).populate(populate_options)

        if ( !bankDetails ) {
            return res.status(200).json({
                message: 'please add a bank account'
            })
        }

        const getAlltransactions = await Transactions.find({ user: req.user._id }).populate(populate_options);

        if ( getAlltransactions.length < 1 ) {
            return res.status(200).json({
                message: 'Insufficient balance'
            })
        }

        let wallet_balance = getAlltransactions[ getAlltransactions.length - 1 ].balance_after;

        wallet_balance = parseInt(wallet_balance,10)

        if ( withdrawalAmount > wallet_balance ) {
            return res.status(200).json({
                message: 'Insufficient balance'
            })
        }

        const createTransaction = new Transactions({
            user: req.user._id,
            amount: withdrawalAmount,
            balance_after: getAlltransactions[ getAlltransactions.length - 1 ].balance_after - withdrawalAmount,
            balance_before: getAlltransactions[ getAlltransactions.length - 1 ].balance_after,
            description: `withdrawal of ${withdrawalAmount} naira`,
            transaction_status:"pending",
            transaction_type:"withdrawal",
            withdrawal_account:{
                ...bankDetails._doc
            }
        })

        const createdTransaction = await createTransaction.save();

        return res.status(200).json({
            message:"your withdrawal request was recieved successfully",
            data: createdTransaction
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const acceptwithdrawalRequest = async (req,res) => {

    try{

        let withdrawalRequestid = req.params.id;

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        if ( !withdrawalRequestid ) {
            return res.status(400).json({
                message:"withdrawal_request_id is required"
            })
        }

        const getWithdrawalRequest = await Transactions.findById(withdrawalRequestid).populate(populate_options);

        if ( !getWithdrawalRequest ) {
            return res.status(400).json({
                message:"withdrawal request with this id dose not exist."
            })
        }

        if ( getWithdrawalRequest.transaction_status === 'failed' || getWithdrawalRequest.transaction_status === 'success' ) {
            return res.status(200).json({
                message:`invalid request, withdrawal request status is ${getWithdrawalRequest.transaction_status}`,
            })
        }

        getWithdrawalRequest.transaction_status = 'success'

        const savedRequest = await getWithdrawalRequest.save();

        
        return res.status(200).json({
            message:"Withdrawal request was approved successfully",
            data: savedRequest
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}


export const declinewithdrawalRequest = async (req,res) => {

    try{

        let withdrawalRequestid = req.params.id
        const cancel_reason = req.body.cancel_reason

        if ( !withdrawalRequestid || !cancel_reason ) {
            return res.status(400).json({
                message:"withdrawal_request_id and cancel_reason are required"
            })
        }

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        }

        const getWithdrawalRequest = await Transactions.findById(withdrawalRequestid).populate(populate_options);

        if ( !getWithdrawalRequest ) {
            return res.status(400).json({
                message:"withdrawal request with this id dose not exist."
            })
        }

        if ( getWithdrawalRequest.transaction_status === 'failed' || getWithdrawalRequest.transaction_status === 'success' ) {
            return res.status(200).json({
                message:`invalid request, withdrawal request status is ${getWithdrawalRequest.transaction_status}`,
            })
        }

        const getAlltransactions = await Transactions.find({ user: getWithdrawalRequest.user }).populate(populate_options);

        if ( getAlltransactions.length < 1 ) {
            return res.status(200).json({
                message: 'Insufficient balance'
            })
        }

        let wallet_balance = getAlltransactions[ getAlltransactions.length - 1 ].balance_after;

        wallet_balance = parseInt(wallet_balance,10)

        const createTransaction = new Transactions({
            user: getWithdrawalRequest.user,
            amount: getWithdrawalRequest.amount,
            balance_after: getAlltransactions[ getAlltransactions.length - 1 ].balance_after + getWithdrawalRequest.amount,
            balance_before: getAlltransactions[ getAlltransactions.length - 1 ].balance_after,
            description: `reversal of ${getWithdrawalRequest.amount} naira`,
            transaction_status:"success",
            transaction_type:"credit",
        })

         await createTransaction.save();
        

        getWithdrawalRequest.transaction_status = 'failed';
        getWithdrawalRequest.description = getWithdrawalRequest.description + ' - ' + cancel_reason;

        const savedRequest = await getWithdrawalRequest.save();
        
        return res.status(200).json({
            message:"Withdrawal request was cancelled successfully",
            data: savedRequest
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}