import { date } from 'yup';
import Category from '../models/category_model.js';
import subCategory from '../models/sub_category_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';


export const createProduct = async (req,res) => {

    try{

        const product_title = req.body.product_title
        const product_price = req.body.product_price
        const product_description = req.body.product_description
        const product_images = req.body.product_images
        const store = req.body.store_id
        const product_category = req.body.category
        const product_subCategory = req.body.sub_category
        const product_features = req.body.product_features
        const isNegotiable = req.body.isNegotiable
        const quantity_available = req.body.quantity_available

        if ( !product_title || 
             !product_price ||
             !product_description ||
             !product_category ||
             !product_subCategory || !product_features || !quantity_available ) {

                return res.status(400).json({
                    error:'product_title, product_price, product_description, product_category, product_features, quantity_available and product_subCategory are required',
                    message:'product_title, product_price, product_description, product_category, product_features, quantity_available and product_subCategory are required',
                }); 

        }

        if ( product_images.length !== 3 ) {
            return res.status(400).json({
                error:"There should be 3 product_images",
                message:"There should be 3 product_images",
            })
        }

        if ( quantity_available < 1 ) {
            return res.status(400).json({
                message:"quantity_available should not be less than 1"
            })
        }

        const categoryCheck = await Category.findById(product_category);
        const subCategoryCheck = await subCategory.findById(product_subCategory);
        const checkStore = await Store.findById(store)

        if ( !checkStore ) {
            return res.status(400).json({
                error:'Only store owners are allowed to create a product.',
                message: 'Only store owners are allowed to create a product.'
            });
        }

        if ( !categoryCheck ) {
            return res.status(400).json({
                error:'Category dose not exist',
                message: 'Category dose not exist'
            });
        }

        if ( !subCategoryCheck ) {
            return res.status(400).json({
                error:'subCategory dose not exist',
                message: 'subCategory dose not exist'
            });
        }

        const createProduct = new Product({
            product_title,
            product_price,
            product_description,
            product_images,
            address: checkStore.address,
            area: checkStore.area,
            state: checkStore.state,
            category: product_category,
            subCategory: product_subCategory,
            user: req.user._id,
            isVerified: false,
            total_bookmarks: 0,
            features:product_features,
            isNegotiable: isNegotiable ? true : false,
            quantity_available,
            isAvailable: true
        })

        const createdProduct = await createProduct.save();

        return res.status(202).json({
            data: createdProduct,
            message: "Your ad was created successfully and is waiting to be approved by an admin"
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


export const editProduct = async (req,res) => {

    try{

        // product_images = {
        //     old:'hdhdhdh',
        //     new: 'wlwlwlwlw'
        // }

        const productId = req.params.id;
        const product_title = req.body.product_title
        const product_price = req.body.product_price
        const product_description = req.body.product_description
        const product_images = req.body.product_images
        const state = req.body.state
        const area = req.body.lga
        const address = req.body.address
        const product_category = req.body.category
        const product_subCategory = req.body.subCategory
        const product_features = req.body.product_features
        const isNegotiable = req.body.isNegotiable
        const quantity_available = req.body.quantity_available
        const isAvailable = req.body.isAvailable


        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(403).json({
                error:'Ad dose not exist',
                message: 'Ad dose not exist'
            });
        }

        console.log({
            user_id:req.user._id,
            user_ib: getProduct.user,
            role: req.user.role
        })

        // if ( req.user._id !== getProduct.user && req.user.role !== 'user' ) {
        //     return res.status(403).json({
        //         error:'You are not authenticated to perform this action',
        //         message: 'You are not authenticated to perform this action'
        //     });
        // }

        if ( product_title ) {
            getProduct.product_title = product_title;
        }

        if ( product_price ) {
            getProduct.product_price = product_price;
        }

        if ( product_description ) {
            getProduct.product_description = product_description;
        }

        if ( product_images ) {
            
            if ( product_images.length > 0 ) {

                var f_images = [...getProduct.product_images];
                
                for (let k = 0; k < product_images.length; k++) {
                    const image_det = product_images[k];
                    const TheIndex = f_images.indexOf(image_det.old);
                    f_images.splice(TheIndex,1,image_det.new);
                }

                getProduct.product_images = f_images

            }

        }

        if ( state ) { 
            getProduct.state = state
        }

        if ( area ) { 
            getProduct.area = area
        }

        if ( address ) { 
            getProduct.address = address
        }

        if ( product_features ) {
            getProduct.features = product_features
        }

        if( product_category ){
           
            const categoryCheck = await Category.findById(product_category);

            if ( !categoryCheck ) {
                return res.status(400).json({
                    error:'Category dose not exist',
                    message: 'Category dose not exist'
                });
            }
            getProduct.category = product_category;
        }

        if ( product_subCategory ){
            const subCategoryCheck = await subCategory.findById(product_subCategory);
            if ( !subCategoryCheck ) {
                return res.status(400).json({
                    error:'subCategory dose not exist',
                    message: 'subCategory dose not exist'
                });
            }
            getProduct.subCategory = product_subCategory;
        }

        if ( isNegotiable !== null ) {
            
            if ( isNegotiable ) {
                getProduct.isNegotiable = true
            }

            if ( !isNegotiable ) {
                getProduct.isNegotiable = false
            }

        }

        if ( quantity_available ) {
            
            if ( quantity_available < 1 ) {
                return res.status(400).json({
                    message:"quantity_available should not be less than 1"
                })
            }

        }

        if ( isAvailable !== null ) {
            
            if ( isAvailable ) {
                getProduct.isAvailable = true
            }

            if ( !isAvailable ) {
                getProduct.isAvailable = false
            }

        }

        const updatedProduct = await getProduct.save();

        return res.status(200).json({
            data:updatedProduct,
            message:'Your ad was updated successfully'
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


export const deleteProduct = async (req,res) => {

    try{

        const productId = req.params.id;
        
        await Product.findByIdAndDelete(productId)

        return res.status(200).json({
            message:'Ad was deleted successfully'
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