# Microservices DevOps Research

A comprehensive research project exploring microservices architecture, service orchestration, and DevOps practices using modern cloud-native technologies.

## 🎯 Research Objectives

This project investigates the implementation and integration of various DevOps tools and microservices patterns, focusing on:
- Service discovery and configuration management
- Distributed tracing and observability
- Message queue patterns
- Load balancing strategies
- Container orchestration
- Logging and monitoring solutions

## 🏗️ Architecture Components

### Service Discovery & Configuration
- **Consul**: Service discovery and distributed configuration
- **Consul-Template**: Dynamic configuration generation
- **Consul-Nginx Integration**: Automated nginx configuration based on service registry

### Load Balancing & Reverse Proxy
- **Traefik**: Modern cloud-native reverse proxy and load balancer
- **Nginx**: High-performance web server and reverse proxy
- **HAProxy**: Reliable, high-performance TCP/HTTP load balancer (archived)

### Microservices
Located in `kf_services/`:
- **kf_users**: User management service
- **kf_roles**: Role and permissions service
- **kf_test**: Testing and development service

Each service includes:
- Express.js REST API
- Docker containerization
- Consul client integration
- Jaeger distributed tracing
- Syslog logging
- Redis caching
- JWT authentication

### Observability & Monitoring
- **Jaeger**: Distributed tracing system
  - OpenTracing implementation
  - Elasticsearch backend for trace storage
  - UI for trace visualization
- **Kibana**: Data visualization and exploration
- **Custom Logger**: Syslog-ng integration for centralized logging

### Message Queue
- **RabbitMQ**: Message broker for asynchronous communication
- **Service Workers**: Consumer workers for message processing
- **UDP Server**: Custom UDP server for log aggregation

### Database
- **MongoDB Replica Set**: 3-node replica configuration
  - High availability setup
  - Automatic failover
  - Data replication
- **MariaDB**: Relational database for structured data

### Container Infrastructure
- **Docker Compose**: Multi-container orchestration
- **Docker Swarm**: Container orchestration (deprecated branch)

## 📁 Project Structure

```
kfm-devops/
├── backend/              # Main backend nginx configuration
├── consul-nginx/         # Consul + Nginx integration
│   ├── consul/          # Consul server setup
│   ├── consul-template/ # Dynamic config templates
│   └── nginx/           # Nginx with consul integration
├── database/            # Database configurations
├── jaeger/              # Distributed tracing setup
├── kf_services/         # Microservices
│   ├── internal/        # Shared libraries
│   │   ├── consul-client/
│   │   ├── jaeger-handle/
│   │   ├── logger/
│   │   ├── models/
│   │   └── redis/
│   ├── kf_roles/        # Role management service
│   ├── kf_test/         # Test service
│   └── kf_users/        # User management service
├── kibana/              # Log visualization
├── mongodb-replicas/    # MongoDB HA setup
├── rabbitmq/            # Message queue + workers
└── traefik/             # Load balancer & reverse proxy
```

## 🔬 Research Areas

### 1. Service Discovery
- **Topic**: Dynamic service registration and discovery
- **Implementation**: Consul with health checks
- **Benefits**: Automatic service detection, health monitoring, configuration sharing

### 2. Distributed Tracing
- **Topic**: Request flow tracking across microservices
- **Implementation**: Jaeger with OpenTracing
- **Benefits**: Performance bottleneck identification, dependency mapping, error tracking

### 3. Centralized Logging
- **Topic**: Aggregated log collection and analysis
- **Implementation**: Syslog-ng + Elasticsearch + Kibana
- **Benefits**: Unified log view, searchable logs, real-time monitoring

### 4. Message-Driven Architecture
- **Topic**: Asynchronous communication patterns
- **Implementation**: RabbitMQ with worker services
- **Benefits**: Decoupled services, load leveling, fault tolerance

### 5. High Availability
- **Topic**: Zero-downtime and fault tolerance
- **Implementation**: MongoDB replica sets, load balancing
- **Benefits**: Automatic failover, data redundancy, increased reliability

### 6. Container Orchestration
- **Topic**: Scalable container deployment
- **Implementation**: Docker Compose for development
- **Benefits**: Consistent environments, easy scaling, resource isolation

### 7. API Gateway Patterns
- **Topic**: Single entry point for microservices
- **Implementation**: Traefik with automatic service discovery
- **Benefits**: Centralized routing, SSL termination, load balancing

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 14+ (for local development)
- Git

### Running the Stack

1. **Start Infrastructure Services**
```bash
# Start databases
docker-compose -f database/docker-compose.yml up -d

# Start MongoDB replica set
docker-compose -f mongodb-replicas/docker-compose.yml up -d

# Start message queue
docker-compose -f rabbitmq/docker-compose.yml up -d

# Start observability stack
docker-compose -f jaeger/docker-compose.yml up -d
docker-compose -f kibana/docker-compose.yml up -d
```

2. **Start Service Discovery**
```bash
docker-compose -f consul-nginx/consul/docker-compose.yml up -d
```

3. **Start Microservices**
```bash
docker-compose -f kf_services/docker-compose.yml up -d
```

4. **Start Load Balancer**
```bash
docker-compose -f traefik/docker-compose.yml up -d
```

### Access Points
- **Traefik Dashboard**: http://localhost:8080
- **Consul UI**: http://localhost:8500
- **Jaeger UI**: http://localhost:16686
- **Kibana**: http://localhost:5601
- **RabbitMQ Management**: http://localhost:15672

## 🧪 Technologies Researched

| Category | Technologies |
|----------|-------------|
| **Languages** | JavaScript (Node.js), Shell Script |
| **Frameworks** | Express.js |
| **Service Mesh** | Consul |
| **Tracing** | Jaeger, OpenTracing |
| **Message Queue** | RabbitMQ |
| **Databases** | MongoDB, MariaDB, Redis |
| **Load Balancers** | Traefik, Nginx, HAProxy |
| **Logging** | Syslog-ng, Elasticsearch, Kibana |
| **Containerization** | Docker, Docker Compose |
| **Security** | JWT, bcrypt |

## 📊 Key Learnings

### Service Discovery with Consul
- Automatic service registration via Docker labels
- Health check integration
- Dynamic configuration with consul-template
- DNS-based service discovery

### Distributed Tracing Insights
- OpenTracing standard implementation
- Context propagation across services
- Performance profiling capabilities
- Error tracking and debugging

### Message Queue Patterns
- Pub/Sub pattern implementation
- Work queue distribution
- Dead letter queue handling
- Message durability

### High Availability Strategies
- Database replication and failover
- Load balancing algorithms
- Health monitoring
- Circuit breaker patterns

## 🔧 Configuration

### Environment Variables
Each service uses environment-specific configuration:
- `config.json`: Production configuration
- `local-config.json`: Local development settings

### Service Communication
- **Internal**: Service-to-service via Consul DNS
- **External**: Client access via Traefik/Nginx

## 📝 Development Notes

### Debugging
- Jaeger UI for trace analysis
- Kibana for log searching
- Consul UI for service health

### Testing
- Individual service testing via `kf_test`
- Integration testing across services
- Load testing with distributed tracing

## 🎓 Future Research

- [ ] Kubernetes migration from Docker Compose
- [ ] Service mesh with Istio/Linkerd
- [ ] Advanced monitoring with Prometheus + Grafana
- [ ] CI/CD pipeline integration
- [ ] Security hardening and secrets management
- [ ] API versioning strategies
- [ ] Blue-green deployment patterns

## 📚 References

- [Consul Documentation](https://www.consul.io/docs)
- [Jaeger Tracing](https://www.jaegertracing.io/docs/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [12-Factor App Methodology](https://12factor.net/)

## 📄 License

Research project for educational purposes.

## 👤 Author

Research conducted by minhnguyen1403

---
**Status**: Active Research | **Last Updated**: January 2026
