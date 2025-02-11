import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { backOff } from 'exponential-backoff';
import { Sensor } from '../database/models/sensor';

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
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await backOff(async () => {
        await this.consumer.connect();
        this.connected = true;
        console.log('Successfully connected to Kafka');
      }, {
        numOfAttempts: 5,
        startingDelay: 1000,
        maxDelay: 5000,
      });
    }
  }

  async subscribe(topic: string, fromBeginning: boolean = true): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning });
  }

  async startProcessing(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '');
          await  await Sensor.create({
            id: data.id,
            timestamp: new Date(data.timestamp),
            sensorType: data.sensorType,
            value: data.value,
            latitude: data.location.lat,
            longitude: data.location.lng,
          });
          console.log(`Processed and stored data: ${data.id}`);
        } catch (error) {
          console.error(`Error processing message: ${message.value}`, error);
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.consumer.disconnect();
      this.connected = false;
    }
  }
}