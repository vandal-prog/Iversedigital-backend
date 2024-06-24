import merchantOrders from "../models/merchant_order_model.js";
import Product from "../models/product_model.js";
import Store from "../models/store_model.js";

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

        const getTotalSales = await merchantOrders.find({ order_status: 'Delivered' })

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