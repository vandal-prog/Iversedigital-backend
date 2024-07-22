import mongoose from "mongoose";
import merchantOrders from "../models/merchant_order_model.js";
import Notification from "../models/notification_model.js"
import Order from "../models/order_model.js"
import riderDetails from "../models/riders_details_model.js"
import Transactions from "../models/transactions_model.js";
import { all_vehicle_type, working_days, working_hours } from "../utils/special_variables.js";
// import {  } from 'mongoose';


function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }

export const createRiderdetails = async ( req, res ) => {

    try{

        const state = req.body.state
        const area = req.body.area
        const address = req.body.address
        const nin_identification_number = req.body.nin_identification_number
        const nin_identification_slip_front = req.body.nin_identification_slip_front
        const nin_identification_slip_back = req.body.nin_identification_slip_back
        const vehicle_type = req.body.vehicle_type
        const vehicle_color = req.body.vehicle_color
        const vehicle_pictures = req.body.vehicle_pictures
        const vehicle_plate_number = req.body.vehicle_plate_number
        const drivers_license_number = req.body.drivers_license_number
        const drivers_license_images_front = req.body.drivers_license_images_front
        const drivers_license_images_back = req.body.drivers_license_images_back
        const working_days_inserted = req.body.working_days
        const start_hour = req.body.start_hour
        const end_hour = req.body.end_hour

        if ( 
            !state ||
            !area || 
            !address || 
            !nin_identification_number || 
            !nin_identification_slip_front || 
            !nin_identification_slip_back || 
            !vehicle_type ||
            !vehicle_color ||
            !vehicle_pictures ||
            !vehicle_plate_number ||
            !drivers_license_number ||
            !drivers_license_images_front ||
            !drivers_license_images_back ||
            !working_days_inserted ||
            !start_hour ||
            !end_hour 
             ) {
                return res.status(400).json({
                    message:'Please fill all fields'
                })
            }

            const checkIfdetailsExisting = await riderDetails.findOne({ user: req.user._id })

            if ( checkIfdetailsExisting ) {
                return res.status(400).json({
                    message:'Rider detials for this user already exists'
                })
            }

            if ( vehicle_pictures.length < 2 ) {
                return res.status(400).json({
                    message:'vehicle_pictures should not be less than 2'
                })
            }

            if( working_days_inserted.length < 1 ){
                return res.status(400).json({
                    message:'no working days was selected'
                })
            }

            var daysSet = new Set(working_days);
            var hoursSet = new Set(working_hours);
            var vehicleSet = new Set(all_vehicle_type);

            if (!hoursSet.has(start_hour)) {
                return res.status(403).json({
                    message:'invalid start hour'
                })
            }

            if (!hoursSet.has(end_hour)) {
                return res.status(403).json({
                    message:'invalid end hour'
                })
            }

            if (!vehicleSet.has(vehicle_type)) {
                return res.status(403).json({
                    message:'invalid vehicle type'
                })
            }

            for (let day of working_days_inserted) {

                if (!daysSet.has(day)) {
                  return res.status(403).json({
                    message:'invalid days in working_days array'
                  })
                }
            }

            const createDetails = new riderDetails({
                user: req.user._id,
                state,
                area,
                address,
                nin_identification_number: parseInt(nin_identification_number,10) ,
                nin_identification_slip:{
                    front: nin_identification_slip_front,
                    back: nin_identification_slip_back
                },
                vehicle_type,
                vehicle_color,
                vehicle_pictures,
                vehicle_plate_number,
                drivers_license_number,
                drivers_license_images:{
                    front: drivers_license_images_front,
                    back: drivers_license_images_back
                }, 
                working_days: working_days_inserted,
                delivery_ratings: 0, 
                rider_status:'offline',
                end_hour,
                start_hour,
                isVerified: false
            })

            const createdRiderdetails = await createDetails.save();
            
            return res.status(200).json({
                message:'Rider details have been saved successfully',
                data: createdRiderdetails
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

export const editRiderdetails = async ( req, res ) => {

    try{

        const state = req.body.state
        const area = req.body.area
        const address = req.body.address
        const working_days_inserted = req.body.working_days
        const start_hour = req.body.start_hour
        const end_hour = req.body.end_hour

        const getRiderdetails = await riderDetails.findOne({ user: req.user._id })

        if ( !getRiderdetails ) {
            return res.status(403).json({
                message:"This rider is yet to be verified"
            })
        }

        if ( state ) {
            getRiderdetails.state = state;
        }

        if ( area ) {
            getRiderdetails.area = area;
        }

        if ( address ) {
            getRiderdetails.address = address;
        }

        var daysSet = new Set(working_days);
        var hoursSet = new Set(working_hours);

        if ( start_hour ) {
            if (!hoursSet.has(start_hour)) {
                return res.status(403).json({
                    message:'invalid start hour'
                })
            }

            getRiderdetails.start_hour = start_hour

        }

        if ( end_hour ) {
            
            if (!hoursSet.has(end_hour)) {
                return res.status(403).json({
                    message:'invalid end hour'
                })
            }

            getRiderdetails.end_hour = end_hour

        }

        if ( working_days_inserted ) {
            
            if( working_days_inserted.length < 1 ){
                return res.status(403).json({
                    message:'no working days was selected'
                })
            }

            for (let day of working_days_inserted) {

                if (!daysSet.has(day)) {
                    return res.status(403).json({
                    message:'invalid days in working_days array'
                    })
                }
            }

            getRiderdetails.working_days = working_days_inserted;

        }

        const saveRiderdetails = await getRiderdetails.save();

        return res.status(200).json({
            message:"Your details were saved successfully",
            data: saveRiderdetails
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

export const getAllavailableOrders = async (req,res) => {

    try{

        const getOrdersAvailable = await Order.find({ order_status: 'Pending' });

        return res.status(200).json({
            message:"Here is a list of all availabe orders",
            data: getOrdersAvailable
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

export const acceptOrder = async (req,res) => {

    try{

        const order_id = req.params.id;

        if ( !req.user.isVerified ) {
            return res.status(400).json({
                message:"Only verified riders can accept orders"
            })
        }

        const getRiderextradet = await riderDetails.findOne({ user: req.user._id })

        if( !getRiderextradet ){

            return res.status(403).json({
                message:"Only verified riders can accept orders"
            })  
        }

        if ( getRiderextradet.rider_status === 'in_transit' ) {
            return res.status(403).json({
                message:"You cannot accept order while delivering an order"
            })  
        }

        if ( !order_id ) {
            return res.status(400).json({
                message:"Order id is required"
            })
        }

        const getOrder = await Order.findById(order_id);

        if ( !getOrder ) {
            return res.status(403).json({
                message:"Order with this id dose not exist"
            })
        }

        if ( getOrder.order_status !== 'Pending' ) {
            return res.status(403).json({
                message:"Order has already been taken by another rider"
            })
        }

        const generatePickUpCode = generateSixDigitNumber();

        const generateDeliveryCode = generateSixDigitNumber();

        getOrder.order_status = 'Order-accepted'

        const riderData = {
            rider_id: req.user._id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            email: req.user.email,
            phone_number: req.user.phone_number,
            profile_img: req.user.profile_img
        }

        getOrder.rider_details = riderData;
        getOrder.delivery_code = generateDeliveryCode;


        const createNotificationUser = new Notification({
            user: getOrder.user,
            description: `A rider just accepted your order`,
            data: getOrder,
            status: 'Unread',
            Notification_type: 'Delivery'
        })

        await createNotificationUser.save()

        getRiderextradet.rider_status = 'in_transit'

        await getRiderextradet.save()

        for (let k = 0; k < getOrder.products.length; k++) {
            const productOrdered = getOrder.products[k];

            getOrder.products[k] = {
                ...getOrder.products[k],
                pick_up_code: generatePickUpCode
            }
            
            const createNotificationStore = new Notification({
                user: getOrder.user,
                description: `A rider is coming to pick up ${ getOrder.order_code } order`,
                data: {
                    order_id,
                    order_code: getOrder.order_code,
                    pick_up_code: generatePickUpCode,
                    product: productOrdered,
                    rider_details: riderData,
                },
                status: 'Unread',
                Notification_type: 'Delivery'
            })
    
            await createNotificationStore.save()

        }

        const updatedOrder =  await getOrder.save();

        return res.status(200).json({
            message:"You have successfully accepted this order",
            data: updatedOrder
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

export const getActiveOrders = async (req, res) => {

    try{

        const activeOrder = await Order.findOne({ order_status: { $in: [ 'In-transit' , 'Order-accepted' ] }, 'rider_details.rider_id': req.user._id  })

        return res.status(200).json({
            message:'Your active orders were gotten successsfully',
            data: activeOrder
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

export const updatedOrderproductStatus = async ( req, res ) => {

    try{

        const orderId = req.params.id
        var productId = req.body.product_order_id

        if ( !orderId || !productId ) {
            return res.status(400).json({
                message:"order id and product_order_id is required"
            })
        }

        // productId = parseInt( productId, 10 )

        const getOrder = await Order.findById(orderId)

        if ( !getOrder ) {
            return res.status(403).json({
                message:"order with this id dose not exist"
            }) 
        }

        if ( getOrder.order_status !== 'Order-accepted' && getOrder.order_status !== 'In-transit' ) {
            return res.status(403).json({
                message:"you can only update accepted order or order that is currently in transit"
            }) 
        }

        const allOrderproducts = [...getOrder.products]

        var result = allOrderproducts.find(product => product.product_id.toString() == productId );

        if( !result ){
            return res.status(403).json({
                message: 'Product with this id dose not exist in the order'
            })
        }

        const productIndex = allOrderproducts.findIndex(product => product.product_id.toString() == productId )

        allOrderproducts[productIndex] = {
            ...allOrderproducts[productIndex],
            delivery_status: 'Collected'
        }

        getOrder.products = allOrderproducts;
        getOrder.order_status = 'In-transit';

        var checkingProduct = allOrderproducts.find(product => product.delivery_status === 'Pending' );

        const createNotificationUser = new Notification({
            user: getOrder.user,
            description: `The rider just picked up ${ allOrderproducts[productIndex].product_title } from the vendor`,
            data: {
                order_id:orderId,
                order_code: getOrder.order_code,
            },
            status: 'Unread',
            Notification_type: 'Delivery'
        })

        const createNotificationMerchant = new Notification({
            user: allOrderproducts[productIndex].store.user,
            description: `The rider just picked up ${ allOrderproducts[productIndex].product_title } from your store`,
            data: {
                order_id:orderId,
                order_code: getOrder.order_code,
            },
            status: 'Unread',
            Notification_type: 'Delivery'
        })

        await createNotificationUser.save()
        await createNotificationMerchant.save()

        if( !checkingProduct ){
            const createNotificationUserDelivery = new Notification({
                user: getOrder.user,
                description: `The rider just picked up all the products in your order and is heading to your delivery location`,
                data: {
                    order_id:orderId,
                    order_code: getOrder.order_code,
                },
                status: 'Unread',
                Notification_type: 'Delivery'
            })

            await createNotificationUserDelivery.save()

        }

       const UpdatedOrder = await getOrder.save()

       return res.status(200).json({
            message:'Order was updated successfully',
            data: UpdatedOrder
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

export const finalDelivery = async ( req, res ) => {

    try{

        const orderId = req.params.id

        const getRiderdetails = await riderDetails.findOne({ user: req.user._id });

        if ( !orderId ) {
            return res.status(400).json({
                message:"order id is required"
            })
        }

        if ( !getRiderdetails ) {
            return res.status(403).json({
                message:"Only verified riders can accept orders"
            })
        }

        const getOrder = await Order.findById(orderId)

        if ( !getOrder ) {
            return res.status(403).json({
                message:"order with this id dose not exist"
            }) 
        }

        // if ( getOrder.order_status !== 'Order-accepted' && getOrder.order_status !== 'In-transit' ) {
        //     return res.status(403).json({
        //         message:"you can only update accepted order or order that is currently in transit"
        //     }) 
        // }

        const allOrderproducts = [...getOrder.products]

        var checkingProduct = allOrderproducts.find(product => product.product_status === 'Pending' );

        if( checkingProduct ){
            return res.status(403).json({
                message:"Some products are yet to be picked up from the vendors"
            }) 
        }

        getOrder.order_status = 'Delivered'

        for (let j = 0; j < getOrder.products.length; j++) {


            const product = getOrder.products[j];

            const amount = parseInt(product.product_price,10) * parseInt(product.quantity,10)
            
            const getStoretransactions = await Transactions.find({ user: product.store.user })

            if ( getStoretransactions.length > 0 ) {

                const lastTransaction = getStoretransactions[ getStoretransactions.length - 1 ];

                const createTransaction = new Transactions({
                    user: product.store.user,
                    amount,
                    balance_after: lastTransaction.balance_after + amount,
                    balance_before: lastTransaction.balance_after,
                    description: `Sale of ${ product.product_title } (${product.quantity})`,
                    transaction_status: 'success',
                    transaction_type: 'credit',
                })

                await createTransaction.save();

            }

            if ( getStoretransactions.length < 1 ) {

                const createTransaction = new Transactions({
                    user: product.store.user,
                    amount,
                    balance_after: amount,
                    balance_before: 0,
                    description: `Sale of ${ product.product.product_title } (${product.product.quantity})`,
                    transaction_status: 'success',
                    transaction_type: 'credit',
                })

                await createTransaction.save();

            }

            const getMerchantOrder = await merchantOrders.findOne({ order_code: getOrder.order_code });

            if ( getMerchantOrder ) {
                getMerchantOrder.order_status = 'Delivered'
                await getMerchantOrder.save()
            }

        }

        const createNotificationUser = new Notification({
            user: getOrder.user,
            description: `Your order ${getOrder.order_code} has been deliverd to your delivery destination`,
            data: {
                order_id:orderId,
                order_code: getOrder.order_code,
            },
            status: 'Unread',
            Notification_type: 'Delivery'
        })

        await createNotificationUser.save()

        const UpdatedOrder = await getOrder.save()

        const amount = parseInt(getOrder.delivery_fee,10)
            
        const getRidertransactions = await Transactions.find({ user: getOrder.rider_details.rider_id })

        if ( getRidertransactions.length > 0 ) {

            const lastTransaction = getRidertransactions[ getRidertransactions.length - 1 ];

            const createTransaction = new Transactions({
                user: req.user._id,
                amount,
                balance_after: lastTransaction.balance_after + amount,
                balance_before: lastTransaction.balance_after,
                description: `Order ${getOrder.order_code} delivery`,
                transaction_status: 'success',
                transaction_type: 'credit',
            })

            await createTransaction.save();

        }

        if ( getRidertransactions.length < 1 ) {

            const createTransaction = new Transactions({
                user: req.user._id,
                amount,
                balance_after: amount,
                balance_before: 0,
                description: `Order ${getOrder.order_code} delivery`,
                transaction_status: 'success',
                transaction_type: 'credit',
            })

            await createTransaction.save();

        }

        getRiderdetails.rider_status = 'online'

        await getRiderdetails.save();

        return res.status(200).json({
                message:'Order was updated successfully',
                data: UpdatedOrder
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

export const getAllDelivered = async ( req, res ) => {

    try{

        const activeOrder = await Order.find({ order_status: 'Delivered', 'rider_details.rider_id': req.user._id  })

        return res.status(200).json({
            message:'Your delivered orders were gotten successsfully',
            data: activeOrder
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