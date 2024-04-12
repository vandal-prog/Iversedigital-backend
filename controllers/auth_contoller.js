import bcrypt from 'bcrypt';
import User from "../models/user_model.js";
import Profile from '../models/profile_model.js';
import jwt from 'jsonwebtoken';
import { date } from 'yup';

export const createUser = async (req,res) => {

    try{

        const email = req.body.email;
        const password = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;

        if ( !email || !password || !first_name || !last_name ) {
            return res.status(400).json({
                has_error: true,
                error:'email, password, first_name and last_name are required',
                message: 'Please fill all fields'
            })
        }

        const CheckUser = await User.findOne({ email: email })

        if ( CheckUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email already exist',
                message: 'User with this email already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password, salt);

        const newUser = new User({
            email,
            password: hashed_password,
            first_name: first_name,
            last_name: last_name,
            role: 'user',
            isVerified: false
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

        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
          });
    }

}

export const userLogin = async (req,res) => {

    try{

        const email = req.body.email;
        const user_password = req.body.password;

        if ( !email || !user_password ) {
            return res.status(400).json({
                has_error: true,
                error:'email and password are required',
                message: 'Please fill all fields'
            })
        }

        const getUser = await User.findOne({ email: email });

        if ( !getUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email dose not exist',
                message: 'User with this email dose not exist'
            })
        }

        const checkPassword = bcrypt.compareSync(user_password, getUser.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Password or email is incorrect',
                message: 'Password or email is incorrect'
            })
        }

        const getUserProfile = await Profile.findOne({ user: getUser.id });

        const generateToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY)

        const { password, ...info } = getUser._doc

        return res.status(200).json({
            message: 'Login was successful',
            data:{
                user: info,
                profile:getUserProfile,
                token: generateToken
            }
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



// Admin routes


export const createAdmin = async (req,res) => {

    try{

        const email = req.body.email;
        const password = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;

        if ( !email || !password || !first_name || !last_name ) {
            return res.status(400).json({
                has_error: true,
                error:'email, password, first_name and last_name are required',
                message: 'Please fill all fields'
            })
        }

        const CheckAdmin = await User.findOne({ email: email })

        if ( CheckAdmin ) {
            return res.status(403).json({
                has_error: true,
                error:'Admin with this email already exist',
                message: 'Admin with this email already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password, salt);

        const newAdmin = new User({
            email,
            password: hashed_password,
            first_name,
            last_name,
            role: 'admin',
            isVerified: false
        })

        const createdAdmin = await newAdmin.save();

        const newProfile = new Profile({
            user: createdAdmin.id
        })

        await newProfile.save()

        return res.status(202).json({
            message:'Admin account was created successfully',
            has_error:false
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

export const loginAdmin = async (req,res) => {

    try{

        const email = req.body.email;
        const user_password = req.body.password;

        if ( !email || !user_password ) {
            return res.status(400).json({
                has_error: true,
                error:'email and password are required',
                message: 'Please fill all fields'
            })
        }

        const getUser = await User.findOne({ email: email });

        if ( !getUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email dose not exist',
                message: 'User with this email dose not exist'
            })
        }

        if ( getUser.role !== 'admin' ) {
            return res.status(403).json({
                has_error: true,
                error:'User is not an admin',
                message: 'User is not an admin'
            })
        }

        const checkPassword = bcrypt.compareSync(user_password, getUser.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Password or email is incorrect',
                message: 'Password or email is incorrect'
            })
        }

        const getUserProfile = await Profile.findOne({ user: getUser.id });

        const generateToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY)

        const { password, ...info } = getUser._doc

        return res.status(200).json({
            message: 'Login was successful',
            data:{
                user: info,
                profile:getUserProfile,
                token: generateToken
            }
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
