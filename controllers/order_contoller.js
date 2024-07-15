import Cart_item from '../models/cart_items_model.js';
import Cart from '../models/cart_model.js';
import merchantOrders from '../models/merchant_order_model.js';
import Notification from '../models/notification_model.js';
import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';
import userAddress from '../models/user_address_model.js';


function generateOrdercode() {
    return(
        Math.random().toString(36).slice(2));
}

// Before Payment
export const createOrderpreview = async (req, res) => {

    try {

        // await Order.deleteMany({ order_status: 'Pending' });

        // return res.status(200).json({
        //     message:"Order was deleted successfully"
        // })

        const populate_options = {
            path: 'product',
            populate:{
                path:'store'
            }
        };

        const getUsercartItems = await Cart_item.find({ user: req.user._id }).populate(populate_options);

        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if ( getUsercartItems.length < 1 ) {
            return res.status(400).json({
                message: 'User cart is empty'
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

        let unQualifiedProducts = []
        let order_product = []

        let totalprice = 0

        let delivery_fee = 0

        getUsercartItems.map(item => {
            // Add a temporary 'totalPrice' field

            if (!item.product.isAvailable) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                return
            }

            if (item.product.quantity_available < item.quantity) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                return
            }

            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            order_product.push({
                ...item._doc,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)

            delivery_fee = delivery_fee + 40

            return item;
        });

        if ( unQualifiedProducts.length > 0 ) {
            return res.status(403).json({
                data: unQualifiedProducts,
                message:"Some product are no longer available, please remove them"
            })
        }


        return res.status(200).json({
            user: req.user._id,
            products: order_product,
            product_total: totalprice,
            service_charge: 10,
            delivery_fee,
            user_delivery_address: getuserAddress,
            order_status: 'Created',
            delivery_details: {},
            delivery_date: '2024-05-26T21:39:41.481Z',
            unQualifiedProducts
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

        const populate_options = {
            path: 'product',
            populate:{
                path:'store',
                populate:{
                    path:'user',
                    select:'first_name last_name _id email profile_img phone_number'
                }
            }
        };

        const getUsercartItems = await Cart_item.find({ user: req.user._id }).populate(populate_options);

        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if ( getUsercartItems.length < 1 ) {
            return res.status(400).json({
                message: 'User cart is empty'
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

        let unQualifiedProducts = []
        let order_product = []

        const generated_order_code = generateOrdercode()

        let totalprice = 0
        let service_charge = 30
        let delivery_fee = 0

        getUsercartItems.map(item => {
            // Add a temporary 'totalPrice' field

            if (!item.product.isAvailable) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                return
            }

            if (item.product.quantity_available < item.quantity) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                return
            }

            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            order_product.push({
                ...item._doc,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)

            delivery_fee = delivery_fee + 40

            return item;
        });

        const createOrder = new Order({
            user: req.user._id,
            products: order_product,
            product_total: totalprice,
            service_charge:30,
            delivery_fee,
            user_delivery_address: {
                ...getuserAddress._doc,
                first_name:  req.user.first_name,
                last_name:  req.user.last_name,
                email: req.user.email,
                phone_number: req.user.phone_number
            },
            order_status: 'Created',
            delivery_details: {},
            order_code: generated_order_code,          
            delivery_date: '2024-05-26T21:39:41.481Z'
        })

        const orderCreated = await createOrder.save();

        const createNotificationUser = new Notification({
            user: req.user._id,
            description: `Your order ${generated_order_code} was placed successfully.`,
            data: {
                order: orderCreated._doc
            },
            status: 'Unread',
            Notification_type: 'Order'
        })

        await createNotificationUser.save()

        if ( unQualifiedProducts.length > 0 ) {
            return res.status(403).json({
                message:"Some product are no longer availabe, please remove them",
                data: unQualifiedProducts
            })
        }

        const createPaymenLink = await fetch(
            `${process.env.PAYMENT_URL}/charges/initialize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`
              },
              body: JSON.stringify({
                amount: totalprice + delivery_fee + service_charge ,
                redirect_url:`https://iversedigital-marketplace.vercel.app/checkout/success?id=${orderCreated.id}`,
                currency: "NGN",
                reference: orderCreated.id,
                narration: `Payment for order - ${generated_order_code}`,
                channels: [
                    "card",
                    "bank_transfer"
                ],
                default_channel: "card",
                customer: {
                    name: `${ req.user.first_name } ${req.user.last_name}`,
                    email: req.user.email
                },
                notification_url: "https://iversedigital-marketplace-backend.onrender.com/api/webhook/order_payment",
                metadata:{
                    order_id: orderCreated.id,
                    user: req.user._id
                }
              })
            }
          );

          if ( createPaymenLink.status !== 200 && createPaymenLink.status !== 202 ) {
            return res.status(200).json({
                message:"Unable to generate payment link"
            })
          }

          const createPaymenLinkResponse = await createPaymenLink.json();

        return res.status(200).json({
            message: 'Your order was placed successfully.',
            data: {
                orderCreated,
                unQualifiedProducts,
                payment_link: createPaymenLinkResponse.data.checkout_url
            }
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






export const updateOrderById = async (req,res) => {

    try{

        const orderId = req.params.id

        if ( !orderId ) {
            return res.status(400).json({
                message: 'Order id is required'
            })
        }

        const getOrder = await Order.findById(orderId)

        if ( !getOrder ) {
            return res.status(400).json({
                message: 'Order with this id dose not exist'
            })
        }

        getOrder.order_status = 'Pending'

        await getOrder.save()

        const getUsercart = await Cart.findOne({ user: getOrder.user })

        if ( getUsercart ) {
            getUsercart.products = []
            getUsercart.total = 0

            await getUsercart.save()
        }

        return res.status(400).json({
            message: 'Order Updated successfully',
            data: getOrder
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

export const getUserorders = async (req,res) => {

    try{

        const getOrders = await Order.find({ user: req.user._id })

        return res.status(200).json({
            message:'Your orders were gotten successfully',
            data: getOrders
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

export const getMerchantOrders = async (req,res) => {

    try{

        const getMerchOrders = await merchantOrders.find({ user: req.user._id });

        return res.status(200).json({
            message:'Your orders were gotten successfully',
            data: getMerchOrders
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

export const trackOrder = async (req,res) => {

    try{

        const tracking_number = req.body.tracking_number

        if ( !tracking_number ) {
            return res.status(400).json({
                message:'tracking_number is required'
            })
        }

        const getOrderbyTrackingNumber = await Order.findOne({ order_code: tracking_number })

        if ( !getOrderbyTrackingNumber ) {
            return res.status(403).json({
                message:'Order with tracking number dose not exist'
            })
        }

        return res.status(200).json({
            message:'Your order details were gotten successfully',
            data: getOrderbyTrackingNumber
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

export const getAllOrders = async (req,res) => {

    try{

        const getAllOrder = await Order.find();

        return res.status(200).json({
            message:"All order was gotten successfuly",
            data: getAllOrder
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