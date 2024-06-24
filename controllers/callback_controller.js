import Callback from "../models/callback_model.js"
import Product from "../models/product_model.js"


export const CreateCallback = async (req,res) => {

    try{

        const productId = req.body.product_id
        const description = req.body.description

        if ( !productId || !description ) {
            return res.status(400).json({
                message:'product_id and description are required'
            })
        }

        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(404).json({
                message:'Product with this id dose not exist'
            })
        }
    
        const createCallback = new Callback({
            user: req.user._id,
            description:description,
            merchant: getProduct.user,
            product: getProduct,
            status: 'pending'
        })

        const createdCallback = await createCallback.save()

        return res.status(200).json({
            data: createdCallback,
            message:"Your Callback was submitted successfully"
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

export const GetAllMerchantCallbacks = async (req,res) => {

    try{

        const populate_options = [{
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        },
        {
            path: 'merchant',
            select: 'first_name last_name _id email profile_img phone_number'
        },
        {
            path: 'product',
            select: 'product_title product_price _id product_description product_images category subCategory'
        }];

        const AllCallbacks = await Callback.find({ merchant: req.user._id }).populate(populate_options)

        return res.status(200).json({
            data: AllCallbacks,
            message:'All callbacks were gotten successfully'
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

export const GetAllUsersCallbacks = async (req,res) => {

    try{

        const populate_options = [{
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        },
        {
            path: 'merchant',
            select: 'first_name last_name _id email profile_img phone_number'
        },
        {
            path: 'product',
            select: 'product_title product_price _id product_description product_images category subCategory'
        }];

        const AllCallbacks = await Callback.find({ users: req.user._id }).populate(populate_options)

        return res.status(200).json({
            data: AllCallbacks,
            message:'All callbacks were gotten successfully'
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

export const UpdateCallback = async (req,res) => {

    try{

        const callback_id = req.params.id
        const status = req.body.status


        if ( !callback_id || !status ) {
            return res.status(400).json({
                message:"callback_id and status are required"
            })
        }

        if ( status !== 'accepted' && status !== 'declined' ) {
            return res.status(400).json({
                message:"status should either be accepted or declined"
            })
        }

        const getCallback = await Callback.findById(callback_id);

        if ( !getCallback ) {
            return res.status(403).json({
                message:"callback with this id dose not exist"
            })
        }

        getCallback.status = status

        await getCallback.save();

        return res.status(200).json({
            message: 'Callback was updated successfully',
            data: getCallback
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

