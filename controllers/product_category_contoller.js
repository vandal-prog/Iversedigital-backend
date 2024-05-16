import { date } from 'yup';
import Category from '../models/category_model.js';
import subCategory from '../models/sub_category_model.js';


export const createCategory = async (req,res) => {

    try{

        const category_name = req.body.category_name
        const category_img = req.body.category_img

        if ( !category_name || !category_img ) {
            return res.status(403).json({
                error:'category_name and category_img is required',
                message: 'category_name and category_img is required'
            });
        }

        const checkIfexisting = await Category.findOne({ category_name: category_name })

        if ( checkIfexisting ) {
            return res.status(403).json({
                error:'Category with this name already exist',
                message: 'Category with this name already exist'
            });
        }

        const newCategory = new Category({
            category_name,
            category_img
        })

        console.log('got here')

        await newCategory.save()

        return res.status(202).json({
            message:'Category was created successfully',
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

export const createsubCategory = async (req,res) => {

    try{

        const sub_category_name = req.body.sub_category_name
        const sub_category_img = req.body.sub_category_img
        const category_id = req.body.category_id
        const sub_category_fields = req.body.sub_category_fields
 
        if ( !sub_category_name || !sub_category_img || !category_id ) {
            return res.status(403).json({
                error:'sub_category_name, category_id and sub_category_img are required',
                message: 'sub_category_name, category_id and sub_category_img are required'
            });
        }

        if ( !sub_category_fields ){
            return res.status(403).json({
                error:'sub_category_fields is required',
                message: 'sub_category_fields is required'
            });
        }

        if ( sub_category_fields.length < 1 ){
            return res.status(403).json({
                error:'sub_category_fields is required',
                message: 'sub_category_fields is required'
            });
        }

        const checkIfexisting = await subCategory.findOne({ subCategory_name: sub_category_name })

        const checkIfcatexisting = await Category.findById(category_id)

        if ( checkIfexisting ) {
            return res.status(403).json({
                error:'sub category with this name already exist',
                message: 'sub category with this name already exist'
            });
        }

        if ( !checkIfcatexisting ) {
            return res.status(403).json({
                error:'Category dose not exist',
                message: 'Category dose not exist'
            });
        }

        const newCategory = new subCategory({
            category: category_id,
            subCategory_img: sub_category_img,
            subCategory_name: sub_category_name,
            fields: sub_category_fields
        })

       const savedsubCategory = await newCategory.save()

        return res.status(202).json({
            message:'Sub category was created successfully',
            has_error:false,
            data: savedsubCategory
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

export const editCategory = async (req,res) => {

    try{

        const category_name = req.body.category_name
        const category_img = req.body.category_img
        const category_id = req.params.id

        if ( !category_id ) {
            return res.status(403).json({
                error:'category_id is required',
                message: 'category_id is required'
            });
        }

        const getCategory = await Category.findById(category_id)

        if ( !getCategory ) {
            return res.status(403).json({
                error:'Category dose not exist',
                message: 'Category dose not exist'
            });
        }

        if ( category_name ) {
         
            const checkIfexisting = await Category.findOne({ category_name: category_name })

            if ( checkIfexisting ) {
                return res.status(403).json({
                    error:'Category with this name already exist',
                    message: 'Category with this name already exist'
                });
            }

            getCategory.category_name = category_name
            
        }

        if ( category_img ) {
            getCategory.category_img = category_img
        }
     
        await getCategory.save();

        return res.status(200).json({
            data: getCategory,
            message: 'Category was updated successfully'
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

export const editsubCategory = async (req,res) => {

    try{

        const subCategory_id = req.params.id
        const subCategory_name = req.body.subCategory_name
        const subCategory_img = req.body.subCategory_img
        const category_id = req.body.category_id
        const sub_category_fields = req.body.sub_category_fields

        if ( !subCategory_id ) {
            return res.status(403).json({
                error:'sub_category id is required',
                message: 'sub_category id is required'
            });
        }

        const getsubCategory = await subCategory.findById(subCategory_id);

        if ( !getsubCategory ) {
            return res.status(403).json({
                error:'sub_category dose not exist',
                message: 'sub_category dose not exist'
            });
        }

        if ( sub_category_fields ){

            if (sub_category_fields.length > 0) {
                getsubCategory.fields = sub_category_fields
            }
        }


        if ( subCategory_name ) {
            
            const existsubCategory = await subCategory.findOne({ subCategory_name: subCategory_name });

            if ( !existsubCategory ) {
                return res.status(403).json({
                    error:'sub_category with that name already exist',
                    message: 'sub_category with that name already exist'
                });
            }

            getsubCategory.subCategory_name = subCategory_name

        }

        if ( subCategory_img ) {
            getsubCategory.subCategory_img = subCategory_img
        }

        if ( category_id ) {
            
            const checkIfcatexisting = await Category.findById(category_id);

            if ( !checkIfcatexisting ) {
                return res.status(403).json({
                    error:'Category dose not exist',
                    message: 'Category dose not exist'
                });
            }

            getsubCategory.category = category_id

        }


        await getsubCategory.save()

        return res.status(200).json({
            data: getsubCategory,
            message: 'sub category was updated successfully'
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

export const deleteCategory = async (req,res) => {

    try{

        const category_id = req.params.id

        if ( !category_id ) {
            return res.status(403).json({
                error:'category_id is required',
                message: 'category_id is required'
            });
        }

        await Category.findByIdAndDelete(category_id)

        return res.status(200).json({
            data: getCategory,
            message: 'Category was deleted successfully'
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

export const deletesubCategory = async (req,res) => {

    try{

        const subCategory_id = req.params.id

        if ( !subCategory_id ) {
            return res.status(403).json({
                error:'sub_category_id is required',
                message: 'sub_category_id is required'
            });
        }

        await subCategory.findByIdAndDelete(subCategory_id)

        return res.status(200).json({
            data: subCategory,
            message: 'subCategory was deleted successfully'
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

export const getAllcategory = async (req,res) => {

    try{

        const allCategories = await Category.find().sort({ _id: -1 })

        var EditedCategories = []

        for (let m = 0; m < allCategories.length; m++) {
            const category = allCategories[m];
            
            const getAllsub = await subCategory.find({ category: category.id })

            EditedCategories.push({
                ...category._doc,
                sub_categories: getAllsub
            })

        }

        return res.status(200).json({
            message: 'All categories gotten successfully',
            data: EditedCategories
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

export const getCategory = async (req,res) => {

    try{

        const category_id = req.params.id

        if ( !category_id ) {
            return res.status(403).json({
                error:'category_id is required',
                message: 'category_id is required'
            });
        }

        const getCategory = await Category.findById(category_id)

        if ( !getCategory ) {
            return res.status(403).json({
                error:'category dose not exist',
                message: 'category dose not exist'
            });
        }

        return res.status(200).json({
            message: 'Category gotten successfully',
            data: getCategory
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

export const getsubCategory = async (req,res) => {

    try{

        const sub_category_id = req.params.id

        if ( !sub_category_id ) {
            return res.status(403).json({
                error:'sub_category_id is required',
                message: 'sub_category_id is required'
            });
        }

        const getsubCategory = await subCategory.findById(sub_category_id)

        if ( !getsubCategory ) {
            return res.status(403).json({
                error:'sub category dose not exist',
                message: 'sub category dose not exist'
            });
        }

        return res.status(200).json({
            message: 'sub Category was gotten successfully',
            data: getsubCategory
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

export const getSubcategories = async (req,res) => {

    try{

        const populate_options = {
            path: 'category',
        };

        const getSubcategories = await subCategory.find().populate(populate_options)

        return res.status(200).json({
            data: getSubcategories,
            message:"All sub categories are gotten successfully"
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