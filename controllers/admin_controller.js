import Product from "../models/product_model.js";


export const getAllproducts = async (req,res) => {

    try{

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

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
            }
        ];

        const aggregationResult = await Product.populate().aggregate([
            {
                $facet: {
                    paginatedData: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize }
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
            error,
            message: 'Something went wrong'
        });
    }

}