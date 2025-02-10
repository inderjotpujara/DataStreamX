import { Kafka, Producer, ProducerConfig } from 'kafkajs';
import { backOff } from 'exponential-backoff';

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
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await backOff(async () => {
        await this.producer.connect();
        this.connected = true;
        console.log('Successfully connected to Kafka');
      }, {
        numOfAttempts: 5,
        startingDelay: 1000,
        maxDelay: 5000,
      });
    }
  }

  async sendMessage(topic: string, messages: any[]): Promise<void> {
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
    } catch (error) {
      console.error('Error sending message to Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}