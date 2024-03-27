import mongoose from 'mongoose';

const connect = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to mongoDB!');
  } catch (error) {
    console.log(error);
  }
};

export default connect;
