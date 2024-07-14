import { date } from 'yup';
import Category from '../models/category_model.js';
import subCategory from '../models/sub_category_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';
import Likes from '../models/liked_product_model.js';
import ProductReviews from '../models/product_review.js';
import mongoose from 'mongoose';

export const getAllproduct = async (req,res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const category = req.query.category;
    const sub_category = req.query.sub_category;
    const titleSearch =  req.query.search || null
    const area =  req.query.area || null
    const state =  req.query.state || null
    const address =  req.query.address || null
    const store =  req.query.store || null
    
    const minPrice = parseInt(req.query.minPrice) || 0; // Replace with the minimum price
    const maxPrice = parseInt(req.query.maxPrice) || 500000000; // Replace with the maximum price

    try{

        let query = {}

        if ( req.user ) {

            // console.log(req.user)
            
            if ( req.user.role !== 'admin' ) {
                query.isVerified = true
            }else{
            }

        }else{
            query.isVerified = true
        }

        if ( category ) {
            query.category = new mongoose.Types.ObjectId(`${category}`)
        }

        if ( sub_category ) {
            query.subCategory = new mongoose.Types.ObjectId(`${sub_category}`)
        }

        if ( store ) {
            query.store = new mongoose.Types.ObjectId(`${store}`)
        }

        if ( titleSearch ) {
            query.product_title = { $regex: titleSearch, $options: 'i' }
        }

        if ( area ) {
            query.area = { $regex: area, $options: 'i' }
        }

        if ( state ) {
            query.state = { $regex: state, $options: 'i' }
        }

        if ( address ) {
            query.address = { $regex: address, $options: 'i' }
        }

        // const featureQuery = { 
        //     'features.brand': 'HP', 
        // };


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

        const populate_options = [
            { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' },
            { from: 'subcategories', localField: 'subCategory', foreignField: '_id', as: 'subCategory' },
            { from: 'stores', localField: 'store', foreignField: '_id', as: 'store' },
        ];

        const lookupStages = populate_options.map(option => ({
            $lookup: {
                from: option.from,
                localField: option.localField,
                foreignField: option.foreignField,
                as: option.as
            }
        }));
        

        const aggregationResult = await Product.aggregate([
            // Convert product_price to a numerical value
            {
                $addFields: {
                    product_price_num: { $toDouble: "$product_price" }
                }
            },
            {$match:Orgquery},
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
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const getProductbyId = async (req,res) => {

    try{

        const productId = req.params.id

        if ( !productId ) {
            return res.status(400).json({
                message: 'product id is required'
            });
        }

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

        const getProduct = await Product.findById(productId).populate(populate_options);

        if ( !getProduct ) {
            return res.status(200).json({
                data:null,
                message:'Product with this id dose not exist'
            })
        }

        const getStore = await Store.findOne({ user: getProduct.user });

        return res.status(200).json({
            data:{...getProduct._doc, store:getStore }
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

export const getProductbystore = async (req,res) => {

    try{

        const store_id = req.params.id

        if ( !store_id ) {
            return res.status(400).json({
                message: 'store id is required'
            });
        }

        const getStore = await Store.findById(store_id);

        if ( !getStore ) {
            return res.status(400).json({
                message: 'store with this id dose not exist'
            });
        }

        const getAllproduct = await Product.find({ user: getStore.user }).populate();

        return res.status(200).json({
            data:getAllproduct,
            store: getStore,
            message:'Store products gotten successfully'
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
             !store ||
             !product_subCategory || !product_features || !quantity_available ) {

                return res.status(400).json({
                    message:'product_title, product_price, product_description, product_category, product_features, quantity_available and product_subCategory are required',
                });

        }

        if ( product_images.length !== 3 ) {
            return res.status(400).json({
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
                message: 'Only store owners are allowed to create a product.'
            });
        }

        if ( !checkStore.is_Verified ) {
            return res.status(400).json({
                message: 'Your store is yet to be verified.'
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
            isAvailable: false,
            likes:0,
            store,
            product_status: 'pending'
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







// Likes endpoint

export const ReactTOproduct = async (req,res) => {

    try{

        const productId = req.params.id

        if ( !productId ) {
            return res.status(400).json({
                message:'product id is required'
            })
        }

        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(400).json({
                message:'Product with that id dose not exist'
            })
        }

        const CheckIfLiked = await Likes.findOne({ user: req.user._id, product: productId })

        if ( !CheckIfLiked ) {
            getProduct.likes = getProduct.likes + 1
            const NewLike = new Likes({
                user: req.user._id,
                product: productId
            })
            await getProduct.save()
            await NewLike.save()

            return res.status(200).json({
                message:'Product was liked successfully'
            })
        }

        getProduct.likes = getProduct.likes > 1 ? getProduct.likes - 1 : 0

        await Likes.findOneAndDelete({ user: req.user._id, product: productId })

        return res.status(200).json({
            message:'Product was unliked successfully'
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

export const AlluserLikedProduct = async (req,res) => {

    try{

        const populate_options = {
            path: 'product',
            select: ''
        };

        const getUserLikedProducts = await Likes.find().populate(populate_options)

        return res.status(200).json({
            data:getUserLikedProducts,
            message:"Liked products gotten successfully"
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

export const getProductLikes = async (req,res) => {

    try{

        const productId = req.params.id

        if ( !productId ) {
            return res.status(400).json({
                message:'product id is required'
            })
        }

        const getProduct = await Product.findById(productId)

        if ( !getProduct ) {
            return res.status(400).json({
                message:'Product with that id dose not exist'
            })
        }

        const populate_options = {
            path: 'user',
            select: 'first_name last_name _id email profile_img phone_number'
        };

        const getProductlikeUser = await Likes.find().populate(populate_options)

        return res.status(200).json({
            data: getProductlikeUser,
            message:'Users gotten successfully'
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




// product reviews

export const ReviewProduct = async (req,res) => {

  try{

    const user = req.user
    const product_id = req.params.id
    const review = req.body.review
    const star_rating = req.body.star_rating

    if ( !product_id ) {
      return res.status(400).json({
        message:"Product id is required"
      })
    }

    if ( !star_rating ) {
      return res.status(400).json({
        message:"Star rating is required"
      })
    }

    if ( star_rating !== 1 && star_rating !== 2 && star_rating !== 3 && star_rating !== 4 && star_rating !== 5 ) {
      return res.status(400).json({
        message:"Star rating shuld either be 1, 2, 3, 4, or 5"
      })
    }

    const getProduct = Product.findById(product_id);

    if ( !getProduct ) {
      return res.status(400).json({
        message:"Product with this id dose not exist"
      })
    }

    const createReview = new ProductReviews({
      user: user._id,
      product: product_id,
      review: review ? review : "",
      star_rating: star_rating
    })

    const newReview = await createReview.save()

    return res.status(200).json({
        data: newReview,
        message:"Your review was taken successfully"
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

export const GetProductReview = async (req,res) => {

    try{

        const product_id = req.params.id
    
        if ( !product_id ) {
          return res.status(400).json({
            message:"Product id is required"
          })
        }
    
        const getProduct = Product.findById(product_id);
    
        if ( !getProduct ) {
          return res.status(400).json({
            message:"Product with this id dose not exist"
          })
        }

        const populate_options = {
            path: 'user',
            select:'first_name last_name email profile_img phone_number'
        }

        const getProductreviews = await ProductReviews.find({ product: product_id }).populate(populate_options)

        return res.status(200).json({
            data:getProductreviews,
            message:"Product reviews gotten successfully"
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
