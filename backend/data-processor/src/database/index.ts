import { Sequelize } from "sequelize";
import { Sensor } from "./models/sensor";
import dotenv from 'dotenv';
import logger from "../utils/logger";
import { backOff } from 'exponential-backoff';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize the Sensor model
Sensor.initModel(sequelize);

export async function initializeDatabase() {
  try {
    // Test connection first
    await backOff(async () => {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
    }, {
      numOfAttempts: 5,
      startingDelay: 2000,
      maxDelay: 5000,
    });

    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully');
    
    // Verify table exists
    const [results] = await sequelize.query(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \'sensors\')'
    );
    const tableExists = (results as any)[0].exists;
    logger.info('Sensors table status', { exists: tableExists });

  } catch (error) {
    logger.error('Failed to initialize database', { 
      error,
      errorMessage: (error as Error).message 
    });
    throw error;
  }
}

export { sequelize, Sensor };