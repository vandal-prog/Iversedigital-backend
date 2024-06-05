import riderDetails from "../models/riders_details_model.js"
import { all_vehicle_type, working_days, working_hours } from "../utils/special_variables.js"


export const createRiderdetails = async ( req, res ) => {

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
            !end_hour 
             ) {
                return res.status(400).json({
                    message:'Please fill all fields'
                })
            }

            const checkIfdetailsExisting = await riderDetails.findOne({ user: req.user._id })

            if ( checkIfdetailsExisting ) {
                return res.status(400).json({
                    message:'Rider detials for this user already exists'
                })
            }

            if ( vehicle_pictures.length < 2 ) {
                return res.status(400).json({
                    message:'vehicle_pictures should not be less than 2'
                })
            }

            if( working_days_inserted.length < 1 ){
                return res.status(400).json({
                    message:'no working days was selected'
                })
            }

            var daysSet = new Set(working_days);
            var hoursSet = new Set(working_hours);
            var vehicleSet = new Set(all_vehicle_type);

            if (!hoursSet.has(start_hour)) {
                return res.status(200).json({
                    message:'invalid start hour'
                })
            }

            if (!hoursSet.has(end_hour)) {
                return res.status(200).json({
                    message:'invalid end hour'
                })
            }

            if (!vehicleSet.has(vehicle_type)) {
                return res.status(200).json({
                    message:'invalid vehicle type'
                })
            }

            for (let day of working_days_inserted) {

                if (!daysSet.has(day)) {
                  return res.status(200).json({
                    message:'invalid days in working_days array'
                  })
                }
            }

            const createDetails = new riderDetails({
                user: req.user._id,
                state,
                area,
                address,
                nin_identification_number: parseInt(nin_identification_number,10) ,
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
                end_hour,
                start_hour,
            })

            const createdRiderdetails = await createDetails.save();
            
            return res.status(200).json({
                message:'Rider details have been saved successfully',
                data: createdRiderdetails
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