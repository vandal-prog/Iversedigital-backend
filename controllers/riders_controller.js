import riderDetails from "../models/riders_details_model.js"
import { working_days } from "../utils/special_variables.js"


const createRiderdetails = async ( req, res ) => {

    try{

        const state = req.body.state
        const area = req.body.area
        const address = req.body.address
        const nin_identification_number = req.body.nin_identification_number
        const nin_identification_slip_front = req.body.nin_identification_slip_front
        const nin_identification_slip_back = req.body.nin_identification_slip_back
        const vehicle_type = req.body.vehicle_type
        const vehicle_color = req.body.vehicle_color
        const vehicle_pictures = req.body.vehicle_pictures
        const vehicle_plate_number = req.body.vehicle_plate_number
        const drivers_license_number = req.body.drivers_license_number
        const drivers_license_images_front = req.body.drivers_license_images_front
        const drivers_license_images_back = req.body.drivers_license_images_back
        const working_days_inserted = req.body.working_days
        const start_hour = req.body.start_hour
        const end_hour = req.body.end_hour
        const delivery_ratings = req.body.delivery_ratings

        if ( 
            !state ||
            !area || 
            !address || 
            !nin_identification_number || 
            !nin_identification_slip_front || 
            !nin_identification_slip_back || 
            !vehicle_type ||
            !vehicle_color ||
            !vehicle_pictures ||
            !vehicle_plate_number ||
            !drivers_license_number ||
            !drivers_license_images_front ||
            !drivers_license_images_back ||
            !working_days_inserted ||
            !start_hour ||
            !end_hour ||
            !delivery_ratings
             ) {
                return res.status(400).json({
                    message:'Please fill all fields'
                })
            }

            if ( vehicle_pictures.length < 2 ) {
                return res.status(400).json({
                    message:'vehicle_pictures should be more than 2'
                })
            }

            if( working_days_inserted.length < 1 ){
                return res.status(400).json({
                    message:'working_days should be more than 1'
                })
            }

            var daysSet = new Set(working_days);

            for (let day of working_days_inserted) {
                // If any day is not in the workingDaysSet, return false immediately
                if (!daysSet.has(day)) {
                  return res.status(200).json({
                    message:'invalid days in working_days array'
                  })
                }
            }

            const checkIfdetailsExisting = await riderDetails({ user: req.user._id })

            if ( checkIfdetailsExisting ) {
                return res.status(400).json({
                    message:'Rider detials for this user already exists'
                })
            }

            const createDetails = new riderDetails({
                user: req.user._id,
                state,
                area,
                address,
                nin_identification_number,
                nin_identification_slip:{
                    front: nin_identification_slip_front,
                    back: nin_identification_slip_back
                },
                vehicle_type,
                vehicle_color,
                vehicle_pictures,
                vehicle_plate_number,
                drivers_license_number,
                drivers_license_images:{
                    front: drivers_license_images_front,
                    back: drivers_license_images_back
                }, 
                working_days: working_days_inserted,
                delivery_ratings: 0, 
                driver_status:'offline',
                
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