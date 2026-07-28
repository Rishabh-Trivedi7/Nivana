import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import configureCloudinary from './config/cloudinary.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    configureCloudinary();

    app.listen(PORT, () => {
      console.log(`Nivana server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
