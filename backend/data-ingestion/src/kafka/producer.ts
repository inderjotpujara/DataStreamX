import { Kafka, Producer } from 'kafkajs';
import { backOff } from 'exponential-backoff';
import logger from '../utils/logger';
import { kafkaMessagesSent, kafkaConnectionErrors, messageProcessingDuration } from '../utils/metrics';

export class KafkaProducerWrapper {
  private producer: Producer;
  private connected: boolean = false;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    this.producer = kafka.producer();
    logger.info('Initialized KafkaProducerWrapper', { clientId, brokers });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      try {
        await backOff(async () => {
          await this.producer.connect();
          this.connected = true;
          logger.info('Successfully connected to Kafka');
        }, {
          numOfAttempts: 5,
          startingDelay: 1000,
          maxDelay: 5000,
        });
      } catch (error) {
        kafkaConnectionErrors.inc();
        logger.error('Failed to connect to Kafka', { 
          error,
          retries: 5,
          maxDelay: 5000
        });
        throw error;
      }
    }
  }

  async sendMessage(topic: string, messages: any[]): Promise<void> {
    const timer = messageProcessingDuration.startTimer();
    try {
      if (!this.connected) {
        await this.connect();
      }

      await this.producer.send({
        topic,
        messages: messages.map(msg => ({
          value: JSON.stringify(msg)
        }))
      });
      
      kafkaMessagesSent.inc({ topic });
      timer();
      
      logger.info('Successfully sent messages to Kafka', { 
        topic, 
        messageCount: messages.length,
        batchSize: messages.length
      });
    } catch (error) {
      timer();
      kafkaConnectionErrors.inc();
      logger.error('Failed to send messages to Kafka', { 
        error,
        topic,
        messageCount: messages.length,
        errorType: (error as Error).name,
        errorMessage: (error as Error).message
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.producer.disconnect();
        this.connected = false;
        logger.info('Disconnected from Kafka');
      } catch (error) {
        kafkaConnectionErrors.inc();
        logger.error('Error disconnecting from Kafka', { 
          error,
          errorType: (error as Error).name,
          errorMessage: (error as Error).message
        });
        throw error;
      }
    }
  }
}