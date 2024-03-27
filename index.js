import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Server from 'http';
// import swaggerDocs from './utils/swagger.js';

import connect from './config/db.js';
import createApp from './utils/createApp.js';

const app = createApp();
const server = Server.createServer(app);

dotenv.config();
mongoose.set('strictQuery', true);

const PORT = process.env.PORT || 5000;

// const app = createServer();
server.listen(PORT, () => {
  connect();
//   swaggerDocs(app);
  console.log(`Server Started at port ${PORT}`);
});
