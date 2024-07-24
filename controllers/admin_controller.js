import mongoose from "mongoose";
import Product from "../models/product_model.js";
import Profile from "../models/profile_model.js";
import Store from "../models/store_model.js";
import User from "../models/user_model.js";
import riderDetails from "../models/riders_details_model.js";
import Transactions from "../models/transactions_model.js";
import deliveryAddress from "../models/delivery_address_model.js";


export const approveOrdeclineProduct = async (req,res) => {

    try{

        const productId = req.params.id
        const action = req.body.action

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
                path: 'store',
                select: '',
            },
            {
                path: 'subCategory',
                select: '',
            },
            {
                path: 'category',
                select: '',
            },
        ];

        if ( !productId || !action ) {
            return res.status(400).json({
                message:"product_id and action is required"
            })
        }

        if ( action !== 'approve' && action !== 'decline'  ) {
            return res.status(400).json({
                message:"action must either me approve or decline"
            })
        }

        const getProduct = await Product.findById(productId).populate(populate_options);

        if ( !getProduct ) {
            return res.status(403).json({
                message:"Product with this id dose not exist"
            })
        }

        if ( getProduct.isVerified && action === 'approve' ) {
            return res.status(403).json({
                message:"Product has already been approved"
            })
        }

        getProduct.isVerified = action === 'approve' ? true : false
        getProduct.isAvailable = action === 'approve' ? true : false
        getProduct.isRejected = action === 'approve' ? false : true
        getProduct.product_status = action === 'approve' ? 'approved' : 'declined'
        
        // Send email to the user or merchant that their product has been approved
        // Send notification as well

        await getProduct.save()

        return res.status(200).json({
            message:"Success",
            data: getProduct
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

export const getAllusers = async (req,res) => {

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const first_name = req.query.first_name;
        const last_name = req.query.last_name;
        const email = req.query.email;
        const role = req.query.role;
        const is_Verified = req.query.is_Verified;
    
        try{
    
            let query = {}
    
            if ( role ) {
                query.role = role
            }

            if ( is_Verified ) {
                query.isVerified = is_Verified === 'true' ? true : false
            }

            if ( first_name ) {
                query.first_name = { $regex: first_name, $options: 'i' }    
            }

            if ( last_name ) {
                query.last_name = { $regex: last_name, $options: 'i' }    
            }

            if ( email ) {
                query.email = { $regex: email, $options: 'i' }    
            }

    
            const Orgquery = { 
                $and: [
                    query
                ]
            };
            
    
            const aggregationResult = await User.aggregate([
                {$match:query},
                {
                    $facet: {
                        paginatedData: [
                            { $skip: (pageNumber - 1) * pageSize },
                            { $limit: pageSize }
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
            error,
            message: 'Something went wrong'
        });
    }

}

export const getUserdetails = async (req,res) => {

    try{

        const userId = req.params.id;

        if ( !userId ) {
            return res.status(400).json({
                message: "user id is required"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number role isVerified createdAt'
            },
        ]

        const getUser = await Profile.findOne({ user: userId }).populate(populate_options)

        if ( !getUser ) {
            return res.status(403).json({
                message:"User with this Id dose not exist"
            })
        }

        return res.status(200).json({
            data: getUser,
            message:"User details gotten successfully"
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

export const getAllstores = async (req,res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const store_name = req.query.store_name;
    const store_category = req.query.store_category;
    const customer_care_number = req.query.customer_care_number;
    const address = req.query.address;
    const user = req.query.user;
    const area = req.query.area;
    const state = req.query.state;
    const has_rider = req.query.has_rider;
    const isCAC_verified = req.query.isCAC_verified;
    const CAC_number = req.query.CAC_number;
    const is_Opened = req.query.is_Opened;
    const is_Available = req.query.is_Available;
    const is_Verified = req.query.is_Verified;

    try{

        let query = {}

        if ( is_Verified ) {
            query.isVerified = is_Verified === 'true' ? true : false
        }

        if ( store_name ) {
            query.store_name = { $regex: store_name, $options: 'i' }    
        }

        if ( user ) {
            query.user = new mongoose.Types.ObjectId(`${user}`)    
        }

        if ( store_category ) {
            query.store_category = new mongoose.Types.ObjectId(`${store_category}`)    
        }

        if ( customer_care_number ) {
            query.customer_care_number = { $regex: customer_care_number, $options: 'i' }    
        }

        if ( address ) {
            query.address = { $regex: address, $options: 'i' }    
        }

        if ( area ) {
            query.area = { $regex: area, $options: 'i' }    
        }

        if ( state ) {
            query.state = { $regex: state, $options: 'i' }    
        }

        if ( CAC_number ) {
            query.state = { $regex: CAC_number, $options: 'i' }    
        }

        if ( has_rider ) {
            query.has_rider = has_rider === 'true' ? true : false    
        }

        if ( isCAC_verified ) {
            query.isCAC_verified = isCAC_verified === 'true' ? true : false    
        }

        if ( is_Opened ) {
            query.is_Opened = is_Opened === 'true' ? true : false    
        }

        if ( is_Available ) {
            query.is_Available = is_Available === 'true' ? true : false;    
        }


        const populate_options = [
            { from: 'users', localField: 'user', foreignField: '_id', as: 'user' },
            { from: 'categories', localField: 'store_category', foreignField: '_id', as: 'store_category' },
        ];

        const lookupStages = populate_options.map(option => ({
            $lookup: {
                from: option.from,
                localField: option.localField,
                foreignField: option.foreignField,
                as: option.as
            }
        }));
        

        const aggregationResult = await Store.aggregate([
            {$match:query},
            {
                $facet: {
                    paginatedData: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize },
                        ...lookupStages
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
            error,
            message: 'Something went wrong'
        });
    }

}

export const getStorebyId = async (req,res) => {

    try{

        const store_id = req.params.id;

        if ( !store_id ) {
            return res.status(400).json({
                message:"store_id is required"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
                path:'store_category',
                select:''
            }
        ]

        const getStore = await Store.findById(store_id).populate(populate_options);

        if ( !getStore ) {
            return res.status(403).json({
                message:"Store with this id dose not exist"
            })
        }

        const getProducts = await Product.find({ user: getStore.user });

        return res.status(200).json({
            message:"success",
            data:{
                store: getStore,
                products: getProducts
            }
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

export const approveOrdeclineStore = async (req,res) => {

    try{

        const storeId = req.params.id;
        const action = req.body.action;

        if ( !storeId || !action ) {
            return res.status(400).json({
                message:'Store id and action is required'
            })
        }

        if ( action !== 'approve' && action !== 'decline'  ) {
            return res.status(400).json({
                message:"action must either me approve or decline"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
                path:'store_category',
                select:''
            }
        ]

        const getStore = await Store.findById(storeId).populate(populate_options)

        if ( !getStore ) {
            return res.status(400).json({
                message:'Store with this id dose not exist'
            })
        }

        if ( getStore.is_Verified && action === 'approve' ) {
            return res.status(403).json({
                message:"Store has already been approved"
            })
        }

        getStore.is_Verified = action === 'approve' ? true : false
        getStore.is_Rejected = action === 'approve' ? false : true

        await getStore.save();

        return res.status(200).json({
            message:"Success",
            data: getStore
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

export const getRiderdetails = async (req,res) => {

    try{

        const rider_id = req.params.id

        if ( !rider_id ) {
            return res.status(400).json({
                message:"rider_id is required"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number role isVerified createdAt'
            },
        ]

        const getRider = await riderDetails.findOne({ user: rider_id }).populate(populate_options)

        if ( !getRider ) {
            return res.status(400).json({
                message:"Rider with this id dose not exist"
            })
        }

        return res.status(200).json({
            data: getRider,
            message:"Data was gotten successfully"
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

export const approveDeclineRider = async (req,res) => {

    try{

        const riderId = req.params.id;
        const action = req.body.action;

        if ( !riderId || !action ) {
            return res.status(400).json({
                message:'Rider id and action is required'
            })
        }

        if ( action !== 'approve' && action !== 'decline'  ) {
            return res.status(400).json({
                message:"action must either me approve or decline"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            }
        ]

        const getRider = await riderDetails.findOne({ user: riderId }).populate(populate_options)

        if ( !getRider ) {
            return res.status(403).json({
                message:"Rider with this id dose not exist"
            })
        }

        if ( getRider.isVerified && action === 'approve' ) {
            return res.status(403).json({
                message:"Rider has already been approved"
            })
        }

        getRider.isVerified = action === 'approve' ? true : false
        getRider.isRejected = action === 'approve' ? false : true

        await getRider.save();

        return res.status(200).json({
            message:"Success",
            data: getRider
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

export const checkAllwithdrawalRequest = async (req,res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const user = req.query.user;
    const transaction_type =  req.query.transaction_type || null
    const transaction_status =  req.query.transaction_status || null
    
    const minPrice = parseInt(req.query.minPrice) || 0; // Replace with the minimum price
    const maxPrice = parseInt(req.query.maxPrice) || 500000000; // Replace with the maximum price

    try{

        let query = {}

        if ( user ) {
            query.user = new mongoose.Types.ObjectId(`${user}`)
        }

        if ( transaction_type ) {
            query.transaction_type = { $regex: transaction_type, $options: 'i' }
        }

        if ( transaction_status ) {
            query.transaction_status = { $regex: transaction_status, $options: 'i' }
        }


        const priceQuery = {
            transaction_amount: { $gte: minPrice, $lte: maxPrice }
        };

        const Orgquery = {  
            $and: [
                query,
                priceQuery
            ]
        };

        const aggregationResult = await Transactions.aggregate([
            // Convert product_price to a numerical value
            {
                $addFields: {
                    transaction_amount: { $toDouble: "$amount" }
                }
            },
            {$match:Orgquery},
            {
                $facet: {
                    paginatedData: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize },
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
            error,
            message: 'Something went wrong'
        });
    }
 
}

export const acceptDeclineWithdrawalRequest = async (req,res) => {

    try{

        const action = req.body.action
        const transaction_id = req.params.id

        if ( !transaction_id || !action ) {
            return res.status(403).json({
                message:"Action and transaction id are required"
            })
        }

        if ( action !== 'approve' && action !== 'decline' ) {
            return res.status(403).json({
                message:"Action should either be approve or decline"
            })
        }

        const gettransaction = await Transactions.findById(transaction_id);

        if ( !gettransaction ) {
            return res.status(403).json({
                message:"Transaction with this ID dose not exist"
            })
        }

        if ( gettransaction.transaction_status !== 'pending' ) {
            return res.status(403).json({
                message:"Only pending withdrawl request can be accepted or declined"
            })
        }

        if ( gettransaction.transaction_type !== 'withdrawal' ) {
            return res.status(403).json({
                message:"Only withdrawl request can be accepted or declined"
            })
        }

        gettransaction.transaction_status = action === 'approve' ? 'success' : 'failed';

        if ( action === 'approve' ) {

            const createNotificationUser = new Notification({
                user: gettransaction.user,
                description: `Your withdrawal request of ${ gettransaction.amount } was approved`,
                data: {
                    transaction_id: gettransaction
                },
                status: 'Unread',
                Notification_type: 'Order'
            })
    
            await createNotificationUser.save()

        }

        if ( action === 'failed' ) {

            const getAlltransactions = await Transactions.find({ user: gettransaction.user });

            let wallet_balance = getAlltransactions[ getAlltransactions.length - 1 ].balance_after;

            const createTransaction = new Transactions({
                user: gettransaction.user,
                amount: gettransaction.amount,
                balance_after: wallet_balance + gettransaction.amount,
                balance_before: wallet_balance,
                description: `reversal of ${gettransaction.amount} naira`,
                transaction_status:"success",
                transaction_type:"reversal",
                withdrawal_account:{
                    ...bankDetails._doc
                }
            })
    
            await createTransaction.save();

            const createNotificationUser = new Notification({
                user: gettransaction.user,
                description: `Your withdrawal request of ${ gettransaction.amount } was declined`,
                data: {
                    transaction_id: gettransaction
                },
                status: 'Unread',
                Notification_type: 'Order'
            })
    
            await createNotificationUser.save()

        }

        return res.status(200).json({
            message: `Withdrawal request was ${ action === 'approve' ? 'approved' : 'declined' }`
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

export const matchingRider = async (req,res) => {

    try{

        const rider_id = req.body.rider_id
        const order_id = req.body.order_id


        if ( !rider_id || !order_id ) {
            return res.status(400).json({
                message:"rider id and order id is required"
            })
        }

        const getRiderextradet = await riderDetails.findOne({ user: rider_id })

        if( !getRiderextradet ){

            return res.status(403).json({
                message:"Only verified riders can be assinged orders"
            })  
        }

        if ( getRiderextradet.rider_status === 'in_transit' ) {
            return res.status(403).json({
                message:"You cannot assign to this rider, he is currently on transit"
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
            message:"You have successfully matched this order with a rider",
            data: updatedOrder
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

export const createDeliveryRoute = async (req,res) => {

    try{

        const from_state = req.body.from_state
        const from_area = req.body.from_area
        const from_street = req.body.from_street
        const to_state = req.body.to_state
        const to_area = req.body.to_area
        const to_street = req.body.to_street
        const delivery_fee = parseInt(req.body.delivery_fee)

        if ( !from_state ||
             !from_area ||
             !from_street ||
             !to_state ||
             !to_area ||
             !to_street ||
             !delivery_fee
         ) {
            return res.status(400).json({
                message:"from_state, from_area, from_street, to_state, to_area, delivery_fee and to_street are required"
            })
        }

        const checkIfexist = await deliveryAddress.findOne({
            from_state,from_area,from_street,to_area,to_state,to_street
        })

        if ( checkIfexist ) {
            return res.status(403).json({
                message:"This delivery routes already exist"
            })
        }

        const createDelivery = new deliveryAddress({
            from_state,
            from_area,
            from_street,
            to_state,
            to_area,
            to_street,
            delivery_fee
        })

        const createdDelivery = await createDelivery.save();

        return res.status(200).json({
            data: createdDelivery,
            message:"Delivery Routes saved successfully"
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

export const updateDeliveryRoute = async (req,res) => {

    try{

        const from_state = req.body.from_state
        const from_area = req.body.from_area
        const from_street = req.body.from_street
        const to_state = req.body.to_state
        const to_area = req.body.to_area
        const to_street = req.body.to_street
        const delivery_fee = req.body.delivery_fee
        const routeId = req.params.id
        
        if ( 
             !routeId
         ) {
            return res.status(400).json({
                message:"routeId is required"
            })
        }

        const checkIfexist = await deliveryAddress.findById(routeId)

        if ( !checkIfexist ) {
            return res.status(403).json({
                message:"This delivery routes with this id dose not exist"
            })
        }

        if ( from_state ) {
            checkIfexist.from_state = from_state
        }

        if ( from_area ) {
            checkIfexist.from_area = from_area
        }

        if ( from_street ) {
            checkIfexist.from_street = from_street
        }

        if ( to_state ) {
            checkIfexist.to_state = to_state
        }

        if ( to_area ) {
            checkIfexist.to_area = to_area
        }

        if ( to_street ) {
            checkIfexist.to_street = to_street
        }

        if ( delivery_fee ) {
            checkIfexist.delivery_fee = delivery_fee
        }

        await checkIfexist.save();

        return res.status(200).json({
            data: checkIfexist,
            message:"Delivery Routes saved successfully"
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

export const getAlldeliveryRoutes = async (req,res) => {

    try{

        const getDeliveryRoutes = await deliveryAddress.find();

        return res.status(200).json({
            data: getDeliveryRoutes,
            message:"Delivery Routes gottten successfully"
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