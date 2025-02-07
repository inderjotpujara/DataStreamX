import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env')
});

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'DATABASE_URL',
  'KAFKA_BROKER'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}


const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});