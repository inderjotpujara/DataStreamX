import dotenv from 'dotenv';
import { sequelize } from './database';
import { KafkaConsumerWrapper } from './kafka/consumer';

// Load environment variables
dotenv.config();

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'data-processor',
  groupId: process.env.KAFKA_GROUP_ID || 'data-processor-group',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  topic: process.env.KAFKA_TOPIC || 'raw-data'
};

async function startProcessing() {
  try {
    // Initialize database
    await sequelize.sync();
    console.log('Database synchronized successfully');

    // Initialize Kafka consumer
    const consumer = new KafkaConsumerWrapper(
      kafkaConfig.clientId,
      kafkaConfig.groupId,
      kafkaConfig.brokers
    );

    // Connect and subscribe
    await consumer.connect();
    await consumer.subscribe(kafkaConfig.topic);
    
    // Start processing messages
    await consumer.startProcessing();
    console.log('Started processing messages');

  } catch (error) {
    console.error('Failed to start processing:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Shutting down...');
  await sequelize.close();
  process.exit(0);
});

startProcessing();