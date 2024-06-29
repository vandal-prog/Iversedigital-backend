import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoute from '../routes/auth.routes.js'
import userRoute from '../routes/user.routes.js'
import categoryRoute from '../routes/category.routes.js'
import productRoute from '../routes/products.routes.js'
import cartRoute from '../routes/carts.routes.js'
import offerRoute from '../routes/offers.routes.js'
import callbackRoute from '../routes/callback.routes.js'
import orderRoute from '../routes/order.routes.js'
import ridersRoute from '../routes/rider.routes.js'
import transactionsRoute from '../routes/transactions.routes.js'
import metricsRoute from '../routes/metrics.routes.js'
import webHookRoute from '../routes/webhook.routes.js'
import adminRoutes from '../routes/admin.routes.js'
// import userRoute from '../routes/user.routes.js';
import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const publicFolder = path.join(__dirname, '..', 'templates', 'public');
function createApp() {
  const app = express();

  app.use(
    cors({
      origin: '*',
      credentials: true
    })
  );
  // app.use(cors());
  // app.use(express.static(publicFolder));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use('/api/auth', authRoute);
  app.use('/api/user', userRoute);
  app.use('/api/category', categoryRoute);
  app.use('/api/product', productRoute);
  app.use('/api/cart',cartRoute)
  app.use('/api/offers',offerRoute)
  app.use('/api/callbacks',callbackRoute)
  app.use('/api/order', orderRoute)
  app.use('/api/rider', ridersRoute)
  app.use('/api/transactions', transactionsRoute)
  app.use('/api/metrics', metricsRoute)
  app.use('/api/webhook', webHookRoute)
  app.use('/api/admin', adminRoutes)

  app.use((err, req, res, next) => {
    // res.header("Access-Control-Allow-Origin", "*");

    // Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,OPTIONS,POST,PUT, DELETE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization'
    );

    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Something went wrong';
    res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
      stack: err.stack
    });

    next();
  });

  return app;
}

export default createApp;
