# Weather Dashboard - Kubernetes ConfigMap & Secret Demo

A comprehensive demo application showcasing how to use Kubernetes ConfigMaps and Secrets for configuration management in a microservices architecture.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Node.js Backend │
│      (Nginx)     │◄──►│    (Express)    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │   Backend       │
│  Service        │    │   Service       │
└─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   ConfigMap     │
                    │   (Cities,      │
                    │   API Config)   │
                    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │    Secret       │
                    │  (API Keys,     │
                    │   Passwords)    │
                    └─────────────────┘
```

## 📋 Components

### Frontend (React + Nginx)
- **Technologies**: React 18, CSS3, Nginx
- **Features**: 
  - Responsive weather dashboard
  - City selection dropdown
  - Real-time weather data display
  - Configuration info display

### Backend (Node.js + Express)
- **Technologies**: Node.js 18, Express, Axios
- **Features**:
  - Weather API proxy
  - ConfigMap-based city configuration
  - Secret-based authentication
  - Health check endpoints
  - Admin configuration endpoint

### Kubernetes Resources
- **ConfigMap**: Non-sensitive configuration (cities, API endpoints)
- **Secret**: Sensitive data (API keys, passwords)
- **Deployments**: Container orchestration
- **Services**: Internal networking

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Node.js 18+ (for local development)

### 1. Build Docker Images
```bash
chmod +x scripts/build-images.sh
./scripts/build-images.sh
```

### 2. Deploy to Kubernetes
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Access the Application
```bash
# Port forward to access locally
kubectl port-forward service/weather-frontend-service 8080:80 -n weather-demo

# Open in browser
open http://localhost:8080
```

## 🎓 Learning Scenarios

### Run Interactive Demo
```bash
chmod +x scripts/demo-scenarios.sh
./scripts/demo-scenarios.sh
```

### Scenario 1: View Configuration
```bash
# View ConfigMap
kubectl get configmap weather-config -o yaml

# View Secret (base64 encoded)
kubectl get secret weather-secrets -o yaml

# Decode secret values
kubectl get secret weather-secrets -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

### Scenario 2: Update ConfigMap
```bash
# Change default city
kubectl patch configmap weather-config --type merge -p '{"data":{"DEFAULT_CITY":"Tokyo"}}'

# Restart deployment to pick up changes
kubectl rollout restart deployment/weather-backend
```

### Scenario 3: Update Secret
```bash
# Update admin password
kubectl patch secret weather-secrets --type merge -p '{"data":{"ADMIN_PASSWORD":"'$(echo -n 'newpassword' | base64)'"}}'

# Restart to apply changes
kubectl rollout restart deployment/weather-backend
```

## 📁 Project Structure

```
weather-dashboard/
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── App.css         # Styling
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx configuration
│   └── package.json        # Dependencies
├── backend/
│   ├── server.js           # Express API server
│   ├── Dockerfile          # Backend container
│   └── package.json        # Dependencies
├── k8s/
│   ├── configmap.yaml      # Configuration data
│   ├── secret.yaml         # Sensitive data
│   ├── backend-deployment.yaml   # Backend K8s resources
│   └── frontend-deployment.yaml  # Frontend K8s resources
├── scripts/
│   ├── build-images.sh     # Build Docker images
│   ├── deploy.sh           # Deploy to Kubernetes
│   └── demo-scenarios.sh   # Interactive learning scenarios
└── README.md               # This file
```

## 🔧 Configuration

### ConfigMap (`weather-config`)
```yaml
DEFAULT_CITY: "London"
API_ENDPOINT: "http://api.openweathermap.org/data/2.5/weather"
CITIES_CONFIG: |
  {
    "london": "London,UK",
    "tokyo": "Tokyo,JP",
    "newyork": "New York,US",
    "sydney": "Sydney,AU"
  }
```

### Secret (`weather-secrets`)
```yaml
OPENWEATHER_API_KEY: <base64-encoded-api-key>
ADMIN_PASSWORD: <base64-encoded-password>
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/weather?city=<city>` - Get weather data
- `GET /api/cities` - List available cities
- `GET /api/demo/config` - Show configuration (demo)

### Admin Endpoints
- `GET /api/admin/config` - Get full configuration (requires admin password header)

### Example Usage
```bash
# Get weather for default city
curl http://localhost:3000/api/weather

# Get weather for specific city
curl http://localhost:3000/api/weather?city=tokyo

# Admin endpoint (requires password header)
curl -H "x-admin-password: admin123" http://localhost:3000/api/admin/config
```

## 🎯 Learning Objectives

After completing this demo, you will understand:

1. **ConfigMap Usage**:
   - Creating and managing ConfigMaps
   - Injecting config as environment variables
   - Mounting config as files
   - Updating configuration without rebuilding images

2. **Secret Management**:
   - Creating and managing Secrets
   - Base64 encoding/decoding
   - Secure injection of sensitive data
   - Best practices for secret handling

3. **Application Configuration**:
   - Separation of config from code
   - Environment-specific configurations
   - 12-factor app methodology
   - Configuration hot-reloading

4. **Kubernetes Deployments**:
   - Deployment strategies
   - Service discovery
   - Health checks
   - Resource management

## 🔍 Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n weather-demo
kubectl logs <pod-name> -n weather-demo
```

**ConfigMap not updating:**
```bash
# ConfigMaps are not automatically reloaded
kubectl rollout restart deployment/weather-backend -n weather-demo
```

**Service not accessible:**
```bash
kubectl get svc -n weather-demo
kubectl port-forward service/weather-frontend-service 8080:80 -n weather-demo
```

**Images not found:**
```bash
# Ensure images are built and available
docker images | grep weather
```

### Debug Commands

```bash
# Check all resources
kubectl get all -n weather-demo

# Check ConfigMap and Secret
kubectl get configmap,secret -n weather-demo

# Exec into pod for debugging
kubectl exec -it <pod-name> -n weather-demo -- /bin/sh

# View environment variables in pod
kubectl exec <pod-name> -n weather-demo -- env | grep -E "(CITY|API|ADMIN)"
```

## 🌟 Extensions

### Add More Features
1. **Database Integration**: Add MongoDB with credentials in Secrets
2. **TLS/SSL**: Configure HTTPS with certificate Secrets
3. **Multi-Environment**: Create dev/staging/prod configurations
4. **Helm Charts**: Package as Helm chart for easier deployment
5. **GitOps**: Add ArgoCD/Flux for GitOps deployment

### Advanced Scenarios
1. **Secret Rotation**: Implement automatic secret rotation
2. **External Secrets**: Use External Secrets Operator
3. **Policy Enforcement**: Add OPA Gatekeeper policies
4. **Monitoring**: Add Prometheus metrics and Grafana dashboards

## 📚 Additional Resources

- [Kubernetes ConfigMaps Documentation](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Kubernetes Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
- [12-Factor App Methodology](https://12factor.net/)
- [OpenWeatherMap API](https://openweathermap.org/api)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Learning! 🎓**

This demo provides hands-on experience with Kubernetes configuration management patterns essential for cloud-native applications.