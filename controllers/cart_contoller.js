import Cart from '../models/cart_model.js';
import Product from '../models/product_model.js';

export const getUserCart = async (req,res) => {

    try{

        const user = req.user

        const getUsercart = await Cart.findOne({ user: user._id });

        if ( !getUsercart ) {
            
            const newCart = new Cart({
                user:user._id,
                products:[],
                total:0
            })

            const createdCart = await newCart.save();

            return res.status(200).json({
                message:"Cart was gotten successfully",
                data: createdCart
            })

        }

        return res.status(200).json({
            message:"Cart was gotten successfully",
            data: getUsercart
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

export const Addtocart = async (req,res) => {

    try{

        const user = req.user
        const product_id = req.body.product_id
        const quantity = req.body.quantity

        if ( !product_id || !quantity ) {
            return res.status(400).json({
                message:'product_id and quantity are required'
            })
        }

        if ( quantity < 1 ) {
            return res.status(403).json({
                message:'quantity should be a number and it shuld not be less than 1'
            })
        }

        const cart_product = await Product.findById(product_id);

        if ( !cart_product ) {
            return ({
                message:"Product dose not exist"
            });
        }

        let getUsercart = await Cart.findOne({ user: user._id });

        if ( !getUsercart ) {
            
            const newCart = new Cart({
                user:user._id,
                products:[],
                total:0
            })

            getUsercart = await newCart.save();

        }

        let UserCartProducts = [...getUsercart.products]

        const ProductExsistingIncart = UserCartProducts.filter( (product) => product.product_id === product_id )

        if ( ProductExsistingIncart.length < 1 ) {
            UserCartProducts.push({ 
                product_id: cart_product.id,
                product_title: cart_product.product_title,
                product_price: cart_product.product_price,
                product_images: cart_product.product_images,
                product_description: cart_product.product_description,
                quantity
            })
        }

        if ( ProductExsistingIncart.length > 0 ) {
            
            const index = UserCartProducts.findIndex( product => product.product_id === product_id );

            UserCartProducts[index] = {
                ...UserCartProducts[index],
                quantity
            }

        }

        let Total = 0

        console.log(UserCartProducts)

        for (let k = 0; k < UserCartProducts.length; k++) {

            const prod = UserCartProducts[k];

            let price = prod.quantity * prod.product_price;
            
            Total = Total + parseInt(price,10)
        }

        getUsercart.products = UserCartProducts
        getUsercart.total = Total

        const UpdatedCart = await getUsercart.save()

        return res.status(200).json({
            message:"Cart was updated successfully",
            data: UpdatedCart
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


export const removeFromcart = async (req,res) => {

    try{

        const user = req.user
        const product_id = req.body.product_id

        let getUsercart = await Cart.findOne({ user: user._id });

        if ( !getUsercart ) {
            
            const newCart = new Cart({
                user:user._id,
                products:[],
                total:0
            })

            getUsercart = await newCart.save();

            return res.status(200).json({
                message:"Cart was updated successfully",
                data: getUsercart
            })

        }

        let UserCartProducts = [...getUsercart.products]

        const index = UserCartProducts.findIndex( product => product.product_id === product_id );

        if ( index !== -1 ) {
            UserCartProducts.splice(index,1)
        }

        let Total = 0

        for (let k = 0; k < UserCartProducts.length; k++) {

            const prod = UserCartProducts[k];

            let price = prod.quantity * parseInt(prod.product_price,10);
            
            Total = Total + price
        }

        getUsercart.products = UserCartProducts
        getUsercart.total = Total

        const UpdatedCart = await getUsercart.save()

        return res.status(200).json({
            message:"Cart was updated successfully",
            data: UpdatedCart
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