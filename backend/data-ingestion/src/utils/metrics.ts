import client from 'prom-client';
import express from 'express';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Define custom metrics
const kafkaMessagesSent = new client.Counter({
  name: 'kafka_messages_sent_total',
  help: 'Total number of messages sent to Kafka',
  labelNames: ['topic']
});

const kafkaConnectionErrors = new client.Counter({
  name: 'kafka_connection_errors_total',
  help: 'Total number of Kafka connection errors'
});

const kafkaMessagesReceived = new client.Counter({
  name: 'kafka_messages_received_total',
  help: 'Total number of messages received from Kafka',
  labelNames: ['topic']
});

const messageProcessingErrors = new client.Counter({
  name: 'message_processing_errors_total',
  help: 'Total number of errors during message processing'
});

const messageProcessingDuration = new client.Histogram({
  name: 'message_processing_duration_seconds',
  help: 'Duration of processing messages in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const databaseOperationDuration = new client.Histogram({
  name: 'database_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Register custom metrics
register.registerMetric(kafkaMessagesSent);
register.registerMetric(kafkaConnectionErrors);
register.registerMetric(kafkaMessagesReceived);
register.registerMetric(messageProcessingErrors);
register.registerMetric(messageProcessingDuration);
register.registerMetric(databaseOperationDuration);

const metricsApp = express();
const metricsPort = process.env.METRICS_PORT || 9091;

metricsApp.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

export function startMetricsServer() {
  metricsApp.listen(metricsPort, () => {
    console.log(`Metrics server listening on port ${metricsPort}`);
  });
}

export {
  register,
  kafkaMessagesSent,
  kafkaConnectionErrors,
  kafkaMessagesReceived,
  messageProcessingErrors,
  messageProcessingDuration,
  databaseOperationDuration
};