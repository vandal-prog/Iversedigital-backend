import merchantOrders from "../models/merchant_order_model.js";
import Order from "../models/order_model.js";
import Product from "../models/product_model.js";
import riderDetails from "../models/riders_details_model.js";
import Store from "../models/store_model.js";
import User from "../models/user_model.js";

export const SellerMetric = async (req,res) => {

    try{

        const getUserstore = await Store.findOne({ user: req.user._id })

        if ( !getUserstore ) {
            return res.status(403).json({
                message:"You don't have a store currently"
            })
        }

        const approvedProducts = await Product.countDocuments({ user: req.user._id, product_status: 'approved' })
        const pendingProducts = await Product.countDocuments({ user: req.user._id, product_status: 'pending' })
        const totalOrders = await merchantOrders.countDocuments({ store: getUserstore._id })

        let totalSales = 0

        const getTotalSales = await merchantOrders.find({ store: getUserstore._id, order_status: 'Delivered' })

        for (let k = 0; k < getTotalSales.length; k++) {
            const theOrder = getTotalSales[k];
            
            let productCost = theOrder.product.product_price * theOrder.product.quantity

            totalSales = totalSales + productCost
        }

        return res.status(200).json({
            data: {
                total_sales: totalSales,
                approved_products: approvedProducts,
                pending_product: pendingProducts,
                total_orders: totalOrders
            },
            message:"Metrics were gotten successfully",
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



export const AdminMetrics = async (req,res) => {

    try{

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const total_completed_order = await Order.countDocuments({ order_status: 'Delivered' })
        const total_pending_order = await Order.countDocuments({ order_status: 'Pending' })
        const total_users = await User.countDocuments({ isVerified: true, role: 'user' })
        const total_rider = await riderDetails.countDocuments({ isVerified: true, isRejected: false })
        const total_pending_rider = await riderDetails.countDocuments({ isVerified: false, isRejected: false })
        const total_stores = await Store.countDocuments({ is_Verified: true, is_Rejected: false })
        const total_pending_stores = await Store.countDocuments({ is_Verified: false, is_Rejected: false })

        const today_orders = await Order.countDocuments({ createdAt: {
            $gte: startOfToday,
            $lt: endOfToday,
        } })
        const total_number_of_products = await Product.countDocuments();
        const total_number_of_approved_products = await Product.countDocuments({ isVerified: true });
        const total_number_of_pending_products = await Product.countDocuments({ isVerified: false, isRejected: false });
        const total_number_of_rejected_products = await Product.countDocuments({ isRejected: true });

        const year = new Date().getFullYear(); // Current year

        const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st at 00:00:00
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st at 23:59:59

        let totalSalesToday = 0

        const getTotalSales = await merchantOrders.find({ order_status: 'Delivered', createdAt: {
            $gte: startOfToday,
            $lt: endOfToday,
        } })

        for (let k = 0; k < getTotalSales.length; k++) {
            const theOrder = getTotalSales[k];
            
            let productCost = theOrder.product.product_price * theOrder.product.quantity

            totalSalesToday = totalSalesToday + productCost
        }

        let totalSalesMonth = 0

        const getMonthTotalSales = await merchantOrders.find({ order_status: 'Delivered', createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth,
        } })

        for (let k = 0; k < getMonthTotalSales.length; k++) {
            const theOrder = getMonthTotalSales[k];
            
            let productCost = theOrder.product.product_price * theOrder.product.quantity

            totalSalesMonth = totalSalesMonth + productCost
        }

        let totalSalesYear = 0

        const getYearTotalSales = await merchantOrders.find({ order_status: 'Delivered', createdAt: {
            $gte: startOfYear,
            $lt: endOfYear, 
        } })

        for (let k = 0; k < getYearTotalSales.length; k++) {
            const theOrder = getYearTotalSales[k];
            
            let productCost = theOrder.product.product_price * theOrder.product.quantity

            totalSalesYear = totalSalesYear + productCost
        }


        return res.status(200).json({
            data:{
                total_completed_order,
                total_pending_order,
                today_orders,
                total_number_of_products,
                total_number_of_approved_products,
                total_number_of_pending_products,
                total_number_of_rejected_products,
                totalSalesToday,
                totalSalesMonth,
                totalSalesYear,
                total_users,
                total_rider,
                total_pending_rider,
                total_stores,
                total_pending_stores
            },
            message:"Metrics gotten successfully"
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