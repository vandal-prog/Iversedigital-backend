import bcrypt from 'bcrypt';
import User from "../models/user_model.js";
import Profile from '../models/profile_model.js';

export const createUser = async (req,res) => {

    try{

        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;

        const CheckUser = await User.findOne({ email: email })

        if ( CheckUser ) {
            return res.status(403).json({
                has_error: true,
                error:error,
                message: 'User with this email already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password, salt);

        const newUser = new User({
            email,
            password: hashed_password,
            name
        })

        const createdUser = await newUser.save();

        const newProfile = new Profile({
            user: createdUser.id
        })

        await newProfile.save()

        return res.status(202).json({
            message:'User account was created successfully',
            has_error:false
        })

    }
    catch (error) {
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
          });
    }

}