import Cart from "../models/cart_model.js"
import Offers from "../models/offers_model.js"
import Product from "../models/product_model.js"


export const CreateOffer = async (req,res) => {

    try{

        const productId = req.body.product_id
        const proposed_price = req.body.proposed_price

        if ( !productId || !proposed_price ) {
            return res.status(400).json({
                message:'product_id and proposed_price are required'
            })
        }

        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(404).json({
                message:'Product with this id dose not exist'
            })
        }

        if ( !getProduct.isNegotiable ) {
            return res.status(404).json({
                message:'Product price is not negotiable'
            })
        }

        const ifOfferexist = await Offers.findOne({ user: req.user._id, product: productId, status: 'pending' })

        if ( ifOfferexist ) {
            
            ifOfferexist.proposed_price = parseInt(proposed_price,10)

            await ifOfferexist.save()

            return res.status(200).json({
                data: ifOfferexist,
                message:'Your offer was updated successfully'
            })

        }

        const createOffer = new Offers({
            user: req.user._id,
            product: productId,
            status: 'pending',
            merchant:getProduct.user,
            proposed_price: parseInt(proposed_price,10)
        })

        const createdOffer = await createOffer.save()

        return res.status(200).json({
            data: createdOffer,
            message:"Your Offer was submitted successfully"
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

export const GetAllMerchantOffers = async (req,res) => {

    try{

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        };

        const AllOffers = await Offers.find({ merchant: req.user._id }).populate(populate_options)

        return res.status(200).json({
            data: AllOffers,
            message:'All product offers were gotten successfully'
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

export const getAllUsersOffers = async (req,res) => {

    try{

        const populate_options = [{
            path: 'product',
            select: 'product_title product_price _id product_description product_images category subCategory'
        },
        {
            path: 'merchant',
            select: 'irst_name last_name _id email profile_img phone_number'
        }];

        const AllOffers = await Offers.find({ user: req.user._id }).populate(populate_options)

        return res.status(200).json({
            data: AllOffers,
            message:'All product offers were gotten successfully'
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

export const AcceptOrDeclineOffers = async (req,res) => {

    try{

        const action = req.body.action
        const offerId = req.params.id

        if ( !action || !offerId ) {
            return res.status(400).json({
                message:'action and offerId are required'
            })
        }

        if ( action !== 'declined' && action !== 'accepted' ) {
            return res.status(403).json({
                message:"action is either declined or accepted"
            })
        }

        const getOffer = await Offers.findById(offerId)

        const getProduct = await Product.findById(getOffer.product)

        if ( !getOffer ) {
            return res.status(403).json({
                message:"Offer with this id dose not exist"
            })
        }

        if ( !getProduct ) {
            return res.status(403).json({
                message:"Product associated with this offer dose not exist"
            })
        }

        if ( action === 'declined' ) {
            getOffer.status = 'declined'
            await getOffer.save()

            return res.status(200).json({
                message:'You ve successfully declined the offer'
            })

        }

        getOffer.status = 'accepted'

        let getUsercart = await Cart.findOne({ user: getOffer.user });

        if ( !getUsercart ) {
            const newCart = new Cart({
                user:getOffer.user,
                products:[],
                total:0
            })
            getUsercart = await newCart.save();
        }

        let UserCartProducts = [...getUsercart.products]

        const ProductExsistingIncart = UserCartProducts.filter( (product) => product.product_id === getOffer.product )

        if ( ProductExsistingIncart.length < 1 ) {
            UserCartProducts.push({
                product_id: getProduct.id,
                product_title: getProduct.product_title,
                product_price: getOffer.proposed_price,
                product_images: getProduct.product_images,
                product_description: getProduct.product_description,
                isAvailable: getProduct.isAvailable,
                quantity:1
            })
        }

        if ( ProductExsistingIncart.length > 0 ) {
            
            const index = UserCartProducts.findIndex( product => product.product_id === getOffer.product );

            UserCartProducts[index] = {
                ...UserCartProducts[index],
                product_price: getOffer.proposed_price
            }

        }

        let Total = 0

        for (let k = 0; k < UserCartProducts.length; k++) {

            const prod = UserCartProducts[k];

            let price = prod.quantity * prod.product_price;
            
            Total = Total + parseInt(price,10)
        }

        getUsercart.products = UserCartProducts
        getUsercart.total = Total

        await getUsercart.save()

        await getOffer.save()

        return res.status(200).json({
            message:'You ve successfully accepted the offer'
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