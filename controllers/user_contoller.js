import Category from '../models/category_model.js';
import Product from '../models/product_model.js';
import Profile from '../models/profile_model.js';
import Store from '../models/store_model.js';
import User from '../models/user_model.js';
import bcrypt from 'bcrypt';

export const getUserdetails = async (req,res) => {

    try{

        const getProfile = await Profile.findOne({ user: req.user._id });

        const { password, ...info } = req.user._doc;

        return res.status(200).json({
            user: info,
            profile:getProfile
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

export const editUserdetails = async (req,res) => {

    try{

        const getProfile = await Profile.findOne({ user: req.user._id })

        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const email = req.body.email
        const location = req.body.location
        const birthday = req.body.birthday
        const sex = req.body.sex
        const profile_img = req.body.profile_img
        const phone_number = req.body.phone_number

        if ( first_name ) {
            req.user.first_name = first_name
        }

        if ( last_name ) {
            req.user.last_name = last_name
        }

        if ( profile_img ) {
            req.user.profile_img = profile_img
        }

        if ( sex ) {

            if ( sex !== 'male' && sex !== 'female' && sex !== 'do_not_specify' ) {
                return res.status(403).json({
                    message: 'sex can only be male, female or do_not_specifiy',
                    error:'sex can only be male, female or do_not_specifiy'
                })
            }

            req.user.sex = sex
        }

        if ( email ) {

            const ifEmailexist = await User.findOne({ email: email })

            if ( ifEmailexist ) {
                return res.status(403).json({
                    message: 'User with this email already exist',
                    error:'User with this email already exist'
                })
            }

            req.user.email = email
        }

        if (phone_number) {
            
            const ifNumberexist = await User.findOne({ phone_number: phone_number })

            if ( ifNumberexist ) {
                return res.status(403).json({
                    message: 'User with this phone number already exist',
                    error:'User with this phone number already exist'
                })
            }

            req.user.phone_number = phone_number

        }

        if ( location ) {
            getProfile.location = location
        }

        if ( birthday ) {
            getProfile.birthday = birthday
        }

        await req.user.save()
        await getProfile.save()

        return res.status(200).json({
            message:'Profile was updated successfully'
        })

    }

    catch (error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const resetUserpassword = async (req,res) => {

    try{

        const old_password = req.body.old_password
        const new_password = req.body.new_password

        if ( !old_password || !new_password ) {
            return res.status(403).json({
                error:'old_password and new_password are required',
                message: 'old_password and new_password are required'
            });
        }

        const checkPassword = bcrypt.compareSync(old_password, req.user.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Incorrect old password',
                message: 'Incorrect old password'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(new_password, salt);

        req.user.password = hashed_password
        
        await req.user.save();

        return res.status(200).json({
            message: 'Password was updated successfully'
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

export const becomeMarchant = async (req,res) => {

    try {

        const UserDet = req.user;
        const store_name = req.body.store_name
        const store_category = req.body.store_category
        const customer_care_number = req.body.customer_care_number
        const address = req.body.address
        const area = req.body.area
        const state = req.body.state
        const has_rider = req.body.has_rider
        const isCAC_verified = req.body.isCAC_verified
        const CAC_number = req.body.CAC_number

        // if ( !UserDet.isVerified ){
        //     return res.status(403).json({
        //         message:'Please verify your email address'
        //     })
        // }

        if ( !store_name || !store_category || !customer_care_number || !address
            || !area || !state ) {
            return res.status(400).json({
                message:'store_name, store_category, customer_care_number, address, area and state are required',
            })
        }

        if ( isCAC_verified && !CAC_number ) {
            return res.status(400).json({
                message:'store_name, store_category, customer_care_number, address, area, state and CAC_number are required',
            })
        }

        const ifStoreexist = await Store.findOne({ customer_care_number: customer_care_number })

        if ( ifStoreexist ) {
            return res.status(400).json({
                message:'customer care number is already in use by another marchant',
            })
        }

        const categoryCheck = await Category.findById(store_category);


        if ( !categoryCheck ) {
            return res.status(400).json({
                error:'Category dose not exist',
                message: 'Category dose not exist'
            });
        }        

        const newStore = new Store({
            store_name,
            user: UserDet._id,
            store_category,
            customer_care_number,
            address,
            area,
            state,
            is_Opened: true,
            is_Available: true,
            has_rider: has_rider ? true : false,
            isCAC_verified: isCAC_verified ? true : false,
            CAC_number: CAC_number ? CAC_number : ''
        })

        const createdStore = await newStore.save();

        return res.status(202).json({
            message: 'Your store was successfully created',
            data: createdStore
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

export const getUserstore = async (req,res) => {

    try{

        const Userdet = req.user;

        const getUserstore = await Store.findOne({ user: Userdet._id })

        if ( !getUserstore ) {
            return res.status(403).json({
                message:"You don't have a store currently"
            })
        }

        return res.status(200).json({
            message:"Store gotten successfully",
            data:getUserstore
        })

    }
    catch(error){

    }

}

export const toggleStoreOpen_Close = async (req,res) => {

    try{

        const Userdet = req.user;

        const getUserstore = await Store.findOne({ user: Userdet._id })

        if ( !getUserstore ) {
            return res.status(403).json({
                message:"You don't have a store currently"
            })
        }

        getUserstore.is_Opened = !getUserstore.is_Opened

        await getUserstore.save()

        return res.status(200).json({
            message: `Your store is now ${ getUserstore.is_Opened ? 'opened' : 'closed' }`,
            data: getUserstore
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

export const edituserStore = async (req,res) => {

    try{

        const Userdet = req.user;
        const store_name = req.body.store_name
        const store_category = req.body.store_category
        const customer_care_number = req.body.customer_care_number
        const address = req.body.address
        const area = req.body.area
        const state = req.body.state
        const has_rider = req.body.has_rider
        const isCAC_verified = req.body.isCAC_verified
        const CAC_number = req.body.CAC_number

        const getUserstore = await Store.findOne({ user: Userdet._id })

        if ( !getUserstore ) {
            return res.status(403).json({
                message:"You don't have a store currently"
            })
        }

        if ( store_name ) {
            getUserstore.store_name = store_name
        }

        if ( store_category ) {
            
            const categoryCheck = await Category.findById(store_category);

            if ( !categoryCheck ) {
                return res.status(400).json({
                    error:'Category dose not exist',
                    message: 'Category dose not exist'
                });
            }

            getUserstore.store_category = store_category

        }

        if ( customer_care_number ) {

            const ifStoreexist = await Store.findOne({ customer_care_number: customer_care_number })

            if ( ifStoreexist ) {
                return res.status(400).json({
                    message:'customer care number is already in use by another marchant',
                })
            }

            getUserstore.customer_care_number = customer_care_number

        }

        if ( address ) {
            getUserstore.address = address
        }

        if ( area ) {
            getUserstore.area = area
        }

        if ( state ) {
            getUserstore.state = state
        }

        if ( has_rider ) {
            getUserstore.has_rider = true
        }

        if ( isCAC_verified && CAC_number ) {
            getUserstore.CAC_number = CAC_number
            getUserstore.isCAC_verified = true
        }

        await getUserstore.save();

        return res.status(200).json({
            message:'You ve successfully updated your store',
            data:getUserstore
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

export const StoreProducts = async (req,res) => {

    try{

        const Userdet = req.user;

        const storeProduct = await Product.find({ user: Userdet._id })

        return res.status(200).json({
            data: storeProduct,
            message:'Store prouct were gotten successfully'
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