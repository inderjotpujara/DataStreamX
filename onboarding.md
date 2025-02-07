# Developer Onboarding Guide

## First-Time Setup

### 1. Development Environment

Ensure you have the following installed:
- Docker Desktop for Mac
- Node.js 18+ (`brew install node`)
- VS Code with extensions:
  - ESLint
  - Prettier
  - Docker
  - TypeScript and JavaScript Language Features

### 2. Project Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DataStreamX.git
cd DataStreamX
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
cd backend
npm install
```

### 3. Running the Project

1. Start all services:
```bash
docker-compose up --build
```

2. Verify services:
- Backend API: http://localhost:3000/health
- PostgreSQL: Available on port 5432
- Kafka: Available on port 9092

## Troubleshooting

### Common Issues

1. **Port Conflicts**
```bash
# Check for processes using required ports
lsof -i :3000
lsof -i :5432
lsof -i :9092
```

2. **Docker Issues**
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
```

### Environment Variables

If the API fails to start, verify your `.env` file contains all required variables:
- PORT
- NODE_ENV
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- DATABASE_URL
- KAFKA_BROKER

## Development Workflow

1. Create a new branch for features:
```bash
git checkout -b feature/your-feature-name
```

2. Run tests before committing:
```bash
npm test
```

3. Follow TypeScript best practices:
- Enable strict mode
- Use proper type annotations
- Avoid `any` types

## Getting Help

- Check the [`/docs`](../docs) directory for specific guides
- Review the project's [README.md](../README.md)
- Contact the team lead for access issues