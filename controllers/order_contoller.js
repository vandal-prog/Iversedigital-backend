import Cart from '../models/cart_model.js';
import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';
import userAddress from '../models/user_address_model.js';


// Before Payment

export const createOrderpreview = async (req, res) => {

    try {

        const getUsercartDetails = await Cart.findOne({ user: req.user._id });
        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if (!getUsercartDetails) {
            return res.status(400).json({
                message: 'User dose not have an existing cart'
            })
        }

        if (!getuserAddress) {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getuserAddress.state === '' || getuserAddress.area === '' || getuserAddress.address === '') {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getUsercartDetails.products.length < 1) {
            return res.status(403).json({
                message: 'user cart is empty'
            })
        }

        let unQualifiedProducts = []

        let order_product = []

        for (let k = 0; k < getUsercartDetails.products.length; k++) {
            const currentProduct = getUsercartDetails.products[k];

            const chekproduct = await Product.findById(currentProduct.product_id)

            if (!chekproduct) continue

            if (!chekproduct.isAvailable) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                continue
            }

            if (chekproduct.quantity_available < currentProduct.quantity) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                continue
            }

            const getProductStore = await Store.findOne({ user: chekproduct.user })

            order_product.push({
                product: currentProduct,
                store_details: {
                    state: getProductStore ? getProductStore.state : null,
                    area: getProductStore ? getProductStore.area : null,
                    address: getProductStore ? getProductStore.address : null,
                    is_Opened: getProductStore ? getProductStore.is_Opened : false
                }
            })

        }

        let Total = 0

        for (let k = 0; k < order_product.length; k++) {

            const prod = order_product[k];

            let price = prod.product.quantity * parseInt(prod.product.product_price, 10);

            Total = Total + price
        }


        return res.status(200).json({
            user: req.user._id,
            products: order_product,
            product_total: Total,
            service_charge: 10,
            delivery_fee: 400,
            user_delivery_address: getuserAddress,
            order_status: 'Created',
            delivery_details: {},
            delivery_date: '2024-05-26T21:39:41.481Z'
        })

    }
    catch (error) {
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

// After payment

export const createOrder = async (req, res) => {

    try {

        // await Order.collection.drop()

        const getUsercartDetails = await Cart.findOne({ user: req.user._id });
        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if (!getUsercartDetails) {
            return res.status(400).json({
                message: 'User dose not have an existing cart'
            })
        }

        if (!getuserAddress) {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getuserAddress.state === '' || getuserAddress.area === '' || getuserAddress.address === '') {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getUsercartDetails.products.length < 1) {
            return res.status(403).json({
                message: 'user cart is empty'
            })
        }

        let unQualifiedProducts = []

        let order_product = []

        for (let k = 0; k < getUsercartDetails.products.length; k++) {
            const currentProduct = getUsercartDetails.products[k];

            const chekproduct = await Product.findById(currentProduct.product_id)

            if (!chekproduct) continue

            if (!chekproduct.isAvailable) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                continue
            }

            if (chekproduct.quantity_available < currentProduct.quantity) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                continue
            }

            chekproduct.quantity_available = chekproduct.quantity_available - currentProduct.quantity

            await chekproduct.save()

            const getProductStore = await Store.findOne({ user: chekproduct.user })

            order_product.push({
                product: currentProduct,
                store_details: {
                    state: getProductStore ? getProductStore.state : null,
                    area: getProductStore ? getProductStore.area : null,
                    address: getProductStore ? getProductStore.address : null,
                    is_Opened: getProductStore ? getProductStore.is_Opened : false
                }
            })

        }

        let Total = 0

        for (let k = 0; k < order_product.length; k++) {

            const prod = order_product[k];

            let price = prod.product.quantity * parseInt(prod.product.product_price, 10);

            Total = Total + price
        }


        const createOrder = new Order({
            user: req.user._id,
            products: order_product,
            product_total: Total,
            service_charge: 10,
            delivery_fee: 400,
            user_delivery_address: getuserAddress,
            order_status: 'Pending',
            delivery_details: {},
            delivery_date: '2024-05-26T21:39:41.481Z'
        })

        const orderCreated = await createOrder.save();

        return res.status(200).json({
            message: 'Your order was placed successfully.',
            data: orderCreated
        })

    }
    catch (error) {
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}