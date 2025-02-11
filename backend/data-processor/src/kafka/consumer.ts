import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { backOff } from 'exponential-backoff';
import { Sensor } from '../database/models/sensor';
import logger from '../utils/logger';
import { messageProcessingDuration, kafkaMessagesReceived, messageProcessingErrors } from '../utils/metrics';

export class KafkaConsumerWrapper {
  private consumer: Consumer;
  private connected: boolean = false;

  constructor(clientId: string, groupId: string, brokers: string[]) { 
    const kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    this.consumer = kafka.consumer({ groupId });
    logger.info('Initialized KafkaConsumerWrapper', { clientId, groupId });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      try {
        await backOff(async () => {
          await this.consumer.connect();
          this.connected = true;
          logger.info('Successfully connected to Kafka');
        }, {
          numOfAttempts: 5,
          startingDelay: 1000,
          maxDelay: 5000,
        });
      } catch (error) {
        logger.error('Failed to connect to Kafka', { error });
        throw error;
      }
    }
  }

  async subscribe(topic: string, fromBeginning: boolean = true): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning });
      logger.info('Subscribed to topic', { topic, fromBeginning });
    } catch (error) {
      logger.error('Failed to subscribe to topic', { topic, error });
      throw error;
    }
  }

  async startProcessing(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const timer = messageProcessingDuration.startTimer();
        try {
          const data = JSON.parse(message.value?.toString() || '');
          logger.debug('Received message', { 
            topic, 
            partition, 
            messageId: data.id 
          });

          kafkaMessagesReceived.inc({ topic });

          await Sensor.create({
            id: data.id,
            timestamp: new Date(data.timestamp),
            sensorType: data.sensorType,
            value: data.value,
            latitude: data.location.lat,
            longitude: data.location.lng,
          });
          
          timer();
          logger.info('Processed and stored data', { 
            id: data.id,
            sensorType: data.sensorType 
          });
        } catch (error) {
          timer();
          messageProcessingErrors.inc();
          logger.error('Error processing message', { 
            error,
            message: message.value?.toString(),
            topic,
            partition 
          });
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.consumer.disconnect();
        this.connected = false;
        logger.info('Disconnected from Kafka');
      } catch (error) {
        logger.error('Error disconnecting from Kafka', { error });
        throw error;
      }
    }
  }
}