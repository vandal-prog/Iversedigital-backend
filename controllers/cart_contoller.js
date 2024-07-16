import Cart_item from '../models/cart_items_model.js';
import Cart from '../models/cart_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';

export const getUserCart = async (req,res) => {

    try{

        const user = req.user

        const populate_options = {
            path: 'product',
            populate:{
                path:'store'
            }
        };

        const getUsercartItems = await Cart_item.find({ user: user._id }).populate(populate_options);

        let UpdatedCart = []
        let totalprice = 0

        getUsercartItems.map(item => {
            // Add a temporary 'totalPrice' field
            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            UpdatedCart.push({
                ...item._doc,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)
            return item;
        });

        return res.status(200).json({
            message:"Cart was gotten successfully",
            data: {
                user:user._id,
                cart_items:UpdatedCart,
                total:totalprice
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

        if ( !cart_product.isVerified) {
            return ({
                message:"Product is yet to be approved by the admin"
            });
        }

        const getproductStore = await Store.findOne({ user: cart_product.user })

        // console.log(getproductStore)
        // console.log(cart_product)

        if ( !getproductStore ) {
            return res.status(403).json({
                    message: 'The store for this product dose not exist'
            })
        }


        if ( getproductStore.state === '' ||
             getproductStore.area === '' ||
             getproductStore.address === ''  ) {
            return res.status(403).json({
                    message: 'The location of the store is yet to be updated'
            })
        }

        if ( parseInt(cart_product.quantity_available,10) < quantity ) {
            return res.status(403).json({
                message:"Product is currently out of stock"
            });
        }

        let UserCartItem = await Cart_item.findOne({ user: user._id, product: product_id })
        

        if ( !UserCartItem ) {
            UserCartItem = new Cart_item({
                product: product_id,
                user: user._id,
                quantity
            })
 
            UserCartItem = await UserCartItem.save();

        }else{
            UserCartItem.quantity = quantity
            await UserCartItem.save()
        }

        const populate_options = {
            path: 'product',
            populate:{
                path:"store"
            }
        };

        const getUsercartItems = await Cart_item.find({ user: user._id }).populate(populate_options);


        let UpdatedCart = []
        let totalprice = 0

        getUsercartItems.map(item => {
            // Add a temporary 'totalPrice' field
            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            UpdatedCart.push({
                ...item._doc,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)
            return item;
        });

        return res.status(200).json({
            message:"Cart was updated successfully",
            data:{
                user:user._id,
                cart_items:UpdatedCart,
                total:totalprice
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


export const removeFromcart = async (req,res) => {

    try{

        const user = req.user
        const product_id = req.body.product_id

        if ( !product_id ) {
            return res.status(400).json({
                message:'product_id are required'
            })
        }

        await Cart_item.findOneAndDelete({ user: user._id, product: product_id })

        const populate_options = {
            path: 'product',
        };

        const getUsercartItems = await Cart_item.find({ user: user._id }).populate(populate_options);

        let UpdatedCart = []
        let totalprice = 0

        getUsercartItems.map(item => {
            // Add a temporary 'totalPrice' field
            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            UpdatedCart.push({
                ...item._doc,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)
            return item;
        });

        return res.status(200).json({
            message:"Cart was updated successfully",
            data:{
                user:user._id,
                cart_items:UpdatedCart,
                total:totalprice
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