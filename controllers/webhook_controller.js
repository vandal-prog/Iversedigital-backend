export const UserOrderPayed = async (req,res) => {

    try{

        console.log(req.body)

        return res.status(200).json({
            message:"Success"
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