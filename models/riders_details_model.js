import mongoose from 'mongoose';

const riderDetailsSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: true,
        required: false
    },
    state:{
        type:String,
        required:false
    },
    area:{
        type: String,
        required:false,
    },
    address:{
        type: String,
        required:false,
    },
    nin_identification_number:{
        type: Number,
        required:false
    },
    nin_identification_slip:{
        type: Object,
        required: false
    },
    vehicle_type:{
        type: String,
        enum: [ 'bike', 'car', 'bus', 'mini_van', 'truck', 'mini_truck' ],
        required: false
    },
    vehicle_color: {
        type: String,
        required: false
    },
    vehicle_pictures: {
        type: Array,
        required: false
    },
    vehicle_plate_number:{
        type: String,
        required: false
    },
    drivers_license_number:{
        type: String,
        required: false
    },
    drivers_license_images:{
        type: Object,
        required: false
    },
    working_days:{
        type:String,
        enum: [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ],
        required: false
    },
    start_hour: {
        type: String,
        enum: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23' ],
        required: false
    },
    end_hour: {
        type: String,
        enum: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23' ],
        required: false
    },
    delivery_ratings: {
        type: Number,
        enum: [ 0 , 1, 2, 3, 4, 5 ],
        required: false
    },
    driver_status: {
        
    }
},{
    timestamps: true
})

const riderDetails = mongoose.model('riderDetails', riderDetailsSchema);

export default riderDetails;
