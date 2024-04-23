import { date } from 'yup';
import Category from '../models/category_model.js';
import subCategory from '../models/sub_category_model.js';
import Product from '../models/product_model.js';


export const createProduct = async (req,res) => {

    try{

        const product_title = req.body.product_title
        const product_price = req.body.product_price
        const product_description = req.body.product_description
        const product_images = req.body.product_images
        const state = req.body.state
        const lga = req.body.lga
        const address = req.body.address
        const product_category = req.body.category
        const product_subCategory = req.body.subCategory

        if ( !product_title || 
             !product_price ||
             !product_description ||
             !state ||
             !lga ||
             !address ||
             !product_category ||
             !product_subCategory ) {

                return res.status(400).json({
                    error:'product_title, product_price, product_description, state, lga, address, product_category and product_subCategory are required',
                    message:'product_title, product_price, product_description, state, lga, address, product_category and product_subCategory are required',
                }); 

        }

        if ( product_images.length !== 3 ) {
            return res.status(400).json({
                error:"There should be 3 product_images",
                message:"There should be 3 product_images",
            })
        }

        const categoryCheck = await Category.findById(product_category);
        const subCategoryCheck = await subCategory.findById(product_subCategory);


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
            address,
            lga,
            state,
            category: product_category,
            subCategory: product_subCategory,
            user: req.user._id,
            isVerified: false,
            total_bookmarks: 0
        })

        const createdProduct = await createProduct();

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
        const lga = req.body.lga
        const address = req.body.address
        const product_category = req.body.category
        const product_subCategory = req.body.subCategory

        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(403).json({
                error:'Ad dose not exist',
                message: 'Ad dose not exist'
            });
        }

        if ( req.user._id !== getProduct.user && req.user.role !== 'admin' ) {
            return res.status(403).json({
                error:'You are not authenticated to perform this action',
                message: 'You are not authenticated to perform this action'
            });
        }

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
                    f_images.splice(TheIndex,0,image_det.new);
                }

                getProduct.product_images = f_images

            }

        }

        if ( state ) { 
            getProduct.state = state
        }

        if ( lga ) { 
            getProduct.lga = lga
        }

        if ( address ) { 
            getProduct.address = address
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