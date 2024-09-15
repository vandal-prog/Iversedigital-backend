import axios from 'axios';
import Cart_item from '../models/cart_items_model.js';
import Cart from '../models/cart_model.js';
import deliveryAddress from '../models/delivery_address_model.js';
import merchantOrders from '../models/merchant_order_model.js';
import Notification from '../models/notification_model.js';
import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';
import Transactions from '../models/transactions_model.js';
import userAddress from '../models/user_address_model.js';


function generateOrdercode() {
    return(
        Math.random().toString(36).slice(2));
}

function generateServiceCharge (total_product_cost) {

    if ( total_product_cost < 1559 && total_product_cost > 0 ) {
        return 150
    }

    if ( total_product_cost < 3001 && total_product_cost > 1559 ) {
        return 200
    }

    if ( total_product_cost < 5001 && total_product_cost > 3001 ) {
        return 250
    }

    if ( total_product_cost < 7001 && total_product_cost > 5001 ) {
        return 350
    }

    if ( total_product_cost < 9001 && total_product_cost > 7001 ) {
        return 400
    }

    if ( total_product_cost > 9001 ) {
        return 500
    }

    return 500

}

const generateDeliveryFee = ( user_delivery, store_delivery, getallDeliveryAddress ) => {

        const filteredAddress = getallDeliveryAddress.filter( 
            address => 
                address.from_state == store_delivery.state && 
                address.from_area == store_delivery.area &&
                address.from_street == store_delivery.street &&
                address.to_state == user_delivery.state &&
                address.to_area == user_delivery.area &&
                address.to_street == user_delivery.street
        )

        console.log(filteredAddress)

        if ( filteredAddress.length < 1 ) {
            return 1000
        }

        return filteredAddress[0].delivery_fee
  
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
                path:'store',
                select: '_id store_name user store_category customer_care_number address area state is_Verified street'
            }
        };

        const getUsercartItems = await Cart_item.find({ user: req.user._id }).populate(populate_options);

        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        const getallDeliveryAddress = await deliveryAddress.find();

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

        if ( getuserAddress.state === '' || 
            getuserAddress.area === '' || 
            getuserAddress.address === '' || 
            getuserAddress.street === '' ||
            !getuserAddress.state || !getuserAddress.area || !getuserAddress.address || !getuserAddress.street ) {
           return res.status(400).json({
               message: 'User has to update their delivery details including state, area, address and street'
           })
       }

        let unQualifiedProducts = []
        let order_product = []

        let totalprice = 0

        let delivery_fee = 0

       const UpdatedProducts = getUsercartItems.map( item => {
            // Add a temporary 'totalPrice' field

            if (!item.product.isAvailable) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                return
            }

            if (item.product.quantity_available < item.quantity) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                return
            }

            const DeliveryFee = generateDeliveryFee(
                {
                    state: getuserAddress.state,
                    area: getuserAddress.area,
                    street: getuserAddress.street
                },
                {
                    state: item.product.store.state,
                    area: item.product.store.area,
                    street: item.product.store.street
                },
                getallDeliveryAddress
            )

            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            order_product.push({
                ...item._doc,
                DeliveryFee:DeliveryFee,
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price)
            })
            
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)

            delivery_fee = delivery_fee + DeliveryFee

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
            service_charge: generateServiceCharge(totalprice),
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

        // Create a new Date object
        const now = new Date();

        // Add one day to the current date
        now.setDate(now.getDate() + 1);

        // Convert to ISO 8601 format
        const isoString = now.toISOString();

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
            path: 'product',
            populate:{
                path:'store',
                select: '_id store_name user store_category customer_care_number address area state is_Verified street',
                populate:{
                    path:'user',
                    select:'first_name last_name _id email profile_img phone_number'
                }
            }
        }];

        const getUsercartItems = await Cart_item.find({ user: req.user._id }).populate(populate_options);

        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        const getallDeliveryAddress = await deliveryAddress.find();

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

        if ( getuserAddress.state === '' || 
             getuserAddress.area === '' || 
             getuserAddress.address === '' || 
             getuserAddress.street === '' ||
             !getuserAddress.state || !getuserAddress.area || !getuserAddress.address || !getuserAddress.street ) {
            return res.status(400).json({
                message: 'User has to update their delivery details including state, area, address and street'
            })
        }

        let unQualifiedProducts = []
        let order_product = []

        const generated_order_code = generateOrdercode()

        let totalprice = 0
        // let service_charge = 30
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

            const DeliveryFee = generateDeliveryFee(
                {
                    state: getuserAddress.state,
                    area: getuserAddress.area,
                    street: getuserAddress.street
                },
                {
                    state: item.product.store.state,
                    area: item.product.store.area,
                    street: item.product.store.street
                },
                getallDeliveryAddress
            )

            if ( DeliveryFee.error ) {
                unQualifiedProducts.push({ product: item.product, quantity: item.quantity, status: 'Invalid Address', message: 'Unable to generate delivery details and fees' })
                return
            }

            item.totalPrice = parseInt(item.quantity) * parseInt(item.product.product_price);
            order_product.push({
                product_id: item._doc.product._id,
                product_title: item._doc.product.product_title,
                product_price: item._doc.product.product_price,
                product_description: item._doc.product.product_description,
                product_images: item._doc.product.product_images,
                isVerified: item._doc.product.isVerified,
                state: item._doc.product.state,
                area: item._doc.product.area,
                street: item._doc.product.street,
                address: item._doc.product.address,
                quantity_available: item._doc.product.quantity_available,
                quantity_available: item._doc.product.quantity_available,
                delivery_status: 'Pending',
                customer:{
                    first_name: item._doc.user.first_name,
                    last_name: item._doc.user.last_name,
                    email: item._doc.user.email,
                    phone_number: item._doc.user.phone_number,
                    profile_img: item._doc.user.profile_img,
                },
                store: {
                    user: item._doc.product.store.user,
                    store: item._doc.product.store,
                    store_name: item._doc.product.store.store_name,
                    store_category: item._doc.product.store.store_category,
                    customer_care_number: item._doc.product.store.customer_care_number,
                    address: item._doc.product.store.address,
                    area: item._doc.product.store.area,
                    state: item._doc.product.store.state,
                    street: item._doc.product.store.street,
                    is_Verified: item._doc.product.store.is_Verified,
                },
                totalPrice: parseInt(item.quantity) * parseInt(item.product.product_price),
                DeliveryFee,
                quantity: item.quantity
            })
            totalprice = totalprice + parseInt(item.quantity) * parseInt(item.product.product_price)

            delivery_fee = delivery_fee + DeliveryFee

            return item;
        });

        let service_charge = generateServiceCharge(totalprice)

        const createOrder = new Order({
            user: req.user._id,
            products: order_product,
            product_total: totalprice,
            service_charge:0,
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
            delivery_date: isoString
        })

        const orderCreated = await createOrder.save();

        if ( unQualifiedProducts.length > 0 ) {
            return res.status(403).json({
                message:"Some product are no longer availabe, please remove them",
                data: unQualifiedProducts
            })
        }

        const createPaymenLink = await axios.post(
            `${process.env.PAYMENT_URL}/charges/initialize`,
                {
                    amount: totalprice + delivery_fee + service_charge ,
                    redirect_url:`https://marketplace.iversedigitals.com.ng/checkout/success`,
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
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`
                    },
                }
          );

        //   if ( createPaymenLink.status !== 200 && createPaymenLink.status !== 202 ) {
        //     return res.status(200).json({
        //         message:"Unable to generate payment link",
        //         data: createPaymenLink
        //     })
        //   }

        //   const createPaymenLinkResponse = await createPaymenLink.json();

        return res.status(200).json({
            message: 'Your order was placed successfully.',
            data: {
                orderCreated,
                unQualifiedProducts,
                payment_link: createPaymenLink.response.data.checkout_url
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

        const orderId = req.query.id
        const reference = req.query.reference

        if ( !orderId || !reference ) {
            return res.status(400).json({
                message: 'Order id and reference are required'
            })
        }

        const getOrder = await Order.findById(orderId)

        if ( !getOrder ) {
            return res.status(400).json({
                message: 'Order with this id dose not exist'
            })
        }

        getOrder.order_status = 'Pending'

        for (let g = 0; g < getOrder.products ; g++) {
            const product = getOrder.products[g];
            
            const newMerchantOrder = new merchantOrders({
                user: product.store.user,
                store: product.store.store,
                order_code: getOrder.order_code,
                product,
                quantity: product.quantity,
                order_status: product.delivery_status,
                customer: product.customer
            })

            await newMerchantOrder.save()

            const createNotificationMerchant = new Notification({
                user: product.store.store.user,
                description: `A customer just placed an order for one of your product`,
                data: {
                    product,
                    user_delivery_address: product.user_delivery_address  
                },
                status: 'Unread',
                Notification_type: 'Sales'
            })
    
            await createNotificationMerchant.save()

        }

        await getOrder.save()

        await Cart_item.deleteMany({ user: getOrder.user });

        const createNotificationUser = new Notification({
            user: getOrder.user,
            description: `Your order ${getOrder.generated_order_code} was placed successfully.`,
            data: {
                order: getOrder.id
            },
            status: 'Unread',
            Notification_type: 'Order'
        })

        await createNotificationUser.save()

        return res.status(200).json({
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


    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const order_status =  req.query.order_status || null
    const delivery_code =  req.query.delivery_code || null
    const order_code =  req.query.order_code || null
    
    const minPrice = parseInt(req.query.minPrice) || 0; // Replace with the minimum price
    const maxPrice = parseInt(req.query.maxPrice) || 500000000; // Replace with the maximum price

    try{

        let query = {}

        if ( order_status ) {
            query.order_status = { $regex: order_status, $options: 'i' }
        }

        if ( delivery_code ) {
            query.delivery_code = { $regex: delivery_code, $options: 'i' }
        }

        if ( order_code ) {
            query.order_code = { $regex: order_code, $options: 'i' }
        }

        const priceQuery = {
            product_price_num: { $gte: minPrice, $lte: maxPrice }
        };

        const Orgquery = {  
            $and: [
                query,
                // featureQuery,
                priceQuery
            ]
        };
    

        const aggregationResult = await Order.aggregate([
            // Convert product_price to a numerical value
            {
                $addFields: {
                    product_price_num: { $toDouble: "$product_total" }
                }
            },
            {$match:Orgquery},
            {
                $facet: {
                    paginatedData: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize },
                        // ...lookupStages
                    ],
                    totalCount: [
                        { $count: "total" }
                    ]
                }
            }

        ]);

        

        const paginatedData = aggregationResult[0]?.paginatedData;
        const totalCount = aggregationResult[0]?.totalCount[0]?.total;
        const totalPages = Math.ceil(totalCount / pageSize);
        const currentPage = pageNumber > totalPages ? totalPages : pageNumber;

        return res.status(200).json({
            data: paginatedData,
            currentPage,
            totalPages,
            totalCount
        });

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