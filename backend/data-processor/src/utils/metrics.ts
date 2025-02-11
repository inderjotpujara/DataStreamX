import client from 'prom-client';
import express from 'express';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
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
  help: 'Duration of message processing in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const databaseOperationDuration = new client.Histogram({
  name: 'database_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

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
  kafkaMessagesReceived,
  messageProcessingErrors,
  messageProcessingDuration,
  databaseOperationDuration
};