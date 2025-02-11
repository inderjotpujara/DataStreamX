import { Kafka } from 'kafkajs';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { KafkaProducerWrapper } from './kafka/producer';
import { startMetricsServer } from './utils/metrics';

// Load environment variables
dotenv.config();

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'data-simulator',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  topic: process.env.KAFKA_TOPIC || 'raw-data',
};

const producer = new KafkaProducerWrapper(kafkaConfig.clientId, kafkaConfig.brokers);

// Kafka client setup
// const kafka = new Kafka({
//   clientId: process.env.KAFKA_CLIENT_ID || 'data-simulator',
//   brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
// });

// const producer = kafka.producer();

// Generate mock sensor data
const generateSensorData = () => ({
  id: faker.string.uuid(),
  timestamp: new Date().toISOString(),
  sensorType: faker.helpers.arrayElement(['temperature', 'humidity', 'pressure']),
  value: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
  location: {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
});

// Main simulation function
async function startSimulation() {
 try {
    await producer.connect();
    startMetricsServer();
    
    setInterval(async () => {
      const batchSize = parseInt(process.env.BATCH_SIZE || '10');
      const messages = Array.from(
        { length: batchSize }, 
        () => generateSensorData()
      );

      try {
        await producer.sendMessage(kafkaConfig.topic, messages);
        console.log(`Successfully sent ${batchSize} messages to Kafka`);
      } catch (error) {
        console.error('Failed to send messages:', error);
      }
    }, parseInt(process.env.SIMULATION_INTERVAL_MS || '1000'));

  } catch (error) {
    console.error('Failed to start simulation:', error);
    process.exit(1);
  }
}

// Start the simulation
startSimulation().catch(console.error);