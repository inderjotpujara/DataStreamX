# DataStreamX

A modern data streaming platform built with TypeScript, Node.js, and React.

## Overview

DataStreamX is a robust platform for handling real-time data streams, featuring:
- TypeScript-based backend API
- PostgreSQL for persistent storage
- Apache Kafka for stream processing
- Containerized development environment

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- npm 8+

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DataStreamX.git
cd DataStreamX
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development environment:
```bash
docker-compose up --build
```

4. Verify the setup by accessing:
- API Health Check: http://localhost:3000/health

## Development

### Project Structure
```
DataStreamX/
├── backend/           # TypeScript API
├── frontend/         # React dashboard (coming soon)
├── docker/          # Docker configurations
└── docs/            # Documentation
```

### Available Scripts
```bash
# Start development environment
docker-compose up

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f api
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](./LICENSE) for details.