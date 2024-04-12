import Profile from '../models/profile_model.js';
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