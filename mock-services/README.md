# Gateway Lab — Mock Microservices

Six Docker containers (3 services × 2 instances) for testing your API Gateway locally.
Single shared image, configured purely through environment variables — no duplication.

---

## Quick Start

```bash
cd mock-services

# First time (or after changing service.js)
./scripts/up.sh --rebuild

# Daily usage
./scripts/up.sh

# Tear down
./scripts/down.sh
```

---

## Port Map

| Container    | Service  | Host port                    | Internal address  |
|-------------|----------|------------------------------|-------------------|
| `users-1`   | users    | http://localhost:3001        | `users-1:3000`    |
| `users-2`   | users    | http://localhost:3002        | `users-2:3000`    |
| `orders-1`  | orders   | http://localhost:3003        | `orders-1:3000`   |
| `orders-2`  | orders   | http://localhost:3004        | `orders-2:3000`   |
| `payments-1`| payments | http://localhost:3005        | `payments-1:3000` |
| `payments-2`| payments | http://localhost:3006        | `payments-2:3000` |

All containers share the `gateway-lab` Docker bridge network.
Your API Gateway container should join this network to reach the upstreams by container name.

---

## Scripts

```bash
./scripts/up.sh              # Start all containers
./scripts/up.sh --rebuild    # Rebuild image first, then start
./scripts/down.sh            # Stop and remove all containers
./scripts/restart.sh         # Restart all containers
./scripts/restart.sh users-1 # Restart a single container
./scripts/logs.sh            # Tail logs for all containers
./scripts/logs.sh orders-2   # Tail logs for one container
```

---

## Endpoint Reference

All endpoints respond with a JSON envelope:

```json
{
  "service":   "users",
  "instance":  "users-1",
  "hostname":  "a1b2c3d4e5f6",
  "timestamp": "2026-05-18T12:00:00.000Z",
  ...
}
```

### Core

| Method | Path             | Description                     |
|--------|------------------|---------------------------------|
| GET    | `/health`        | Health check (used by Docker)   |
| GET    | `/info`          | PID, uptime, memory, Node version |
| GET    | `/:resource/:id` | Fake resource record            |

### Failure Simulation

| Method    | Path                    | Query params            | Description                         |
|-----------|-------------------------|-------------------------|-------------------------------------|
| GET       | `/slow`                 | `delay` (ms, max 30000) | Sleeps then responds                |
| GET       | `/error`                | —                       | Always returns 500                  |
| GET       | `/random-failure`       | `rate` (0–1, default 0.5) | Fails randomly at given rate      |
| GET       | `/headers`              | —                       | Echoes all incoming headers         |
| GET/POST  | `/echo`                 | —                       | Echoes method, query, headers, body |

---

## curl Examples

### Health & Info

```bash
# Health check
curl -s http://localhost:3001/health | jq

# Instance info
curl -s http://localhost:3002/info | jq
```

### Resource Records

```bash
# Fetch a user
curl -s http://localhost:3001/users/42 | jq

# Fetch an order
curl -s http://localhost:3003/orders/99 | jq

# Fetch a payment
curl -s http://localhost:3005/payments/7 | jq
```

### Failure Simulation

```bash
# 2-second delay (default)
curl -s http://localhost:3001/slow | jq

# Custom delay — 5 seconds
curl -s "http://localhost:3001/slow?delay=5000" | jq

# Always 500
curl -s http://localhost:3001/error | jq

# 70% failure rate
curl -s "http://localhost:3001/random-failure?rate=0.7" | jq

# Echo headers (useful to verify gateway injects X-Request-Id, Authorization, etc.)
curl -s http://localhost:3001/headers \
  -H "Authorization: Bearer test-token" \
  -H "X-Request-Id: req-abc-123" \
  -H "X-Forwarded-For: 10.0.0.1" | jq

# Echo body (verify gateway forwards POST bodies)
curl -s -X POST http://localhost:3001/echo \
  -H "Content-Type: application/json" \
  -d '{"amount": 99.99, "currency": "USD"}' | jq
```

### Load-Balancing Test Loop

Send 10 requests through your gateway and watch which instance responds:

```bash
# Direct (bypasses gateway — confirms both instances are alive)
for i in $(seq 1 10); do
  curl -s http://localhost:3001/health | jq -r '.instance'
  curl -s http://localhost:3002/health | jq -r '.instance'
done

# Through gateway (replace PORT with your gateway port)
for i in $(seq 1 10); do
  curl -s http://localhost:8000/users/health | jq -r '"instance: " + .instance'
done
```

---

## Registering Upstreams in Your API Gateway

Use your gateway's admin API to register these containers.
Replace `<ADMIN_BASE_URL>` with your gateway's base URL (e.g., `http://localhost:8000`).

### 1. Create Services

```bash
# Users service
USERS_UID=$(curl -s -X POST $ADMIN_BASE_URL/admin/routing/services \
  -H "Content-Type: application/json" \
  -d '{"name":"users","protocol":"http"}' | jq -r '.uid')
echo "users uid: $USERS_UID"

# Orders service
ORDERS_UID=$(curl -s -X POST $ADMIN_BASE_URL/admin/routing/services \
  -H "Content-Type: application/json" \
  -d '{"name":"orders","protocol":"http"}' | jq -r '.uid')

# Payments service
PAYMENTS_UID=$(curl -s -X POST $ADMIN_BASE_URL/admin/routing/services \
  -H "Content-Type: application/json" \
  -d '{"name":"payments","protocol":"http"}' | jq -r '.uid')
```

### 2. Register Service Instances

When the gateway runs in the same Docker network (`gateway-lab`), use container names as hosts:

```bash
# users-1 (higher weight = more traffic)
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\",\"host\":\"users-1\",\"port\":3000,\"weight\":2}"

# users-2
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\",\"host\":\"users-2\",\"port\":3000,\"weight\":1}"

# orders-1
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$ORDERS_UID\",\"host\":\"orders-1\",\"port\":3000,\"weight\":1}"

# orders-2
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$ORDERS_UID\",\"host\":\"orders-2\",\"port\":3000,\"weight\":1}"

# payments-1
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$PAYMENTS_UID\",\"host\":\"payments-1\",\"port\":3000,\"weight\":1}"

# payments-2 — start unhealthy to test health-check gating
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$PAYMENTS_UID\",\"host\":\"payments-2\",\"port\":3000,\"weight\":1,\"isHealthy\":false}"
```

> **Running on host (not in Docker)?** Use `localhost` instead of container names,
> and the mapped host ports (3001–3006).

### 3. Create Routes

```bash
# GET /users/:id
curl -s -X POST $ADMIN_BASE_URL/admin/routing/routes \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\",\"pathPattern\":\"/users/:id\",\"method\":\"GET\",\"priority\":10}"

# All methods on /users/*
curl -s -X POST $ADMIN_BASE_URL/admin/routing/routes \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\",\"pathPattern\":\"/users/*\",\"method\":null,\"priority\":5}"

# Orders
curl -s -X POST $ADMIN_BASE_URL/admin/routing/routes \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$ORDERS_UID\",\"pathPattern\":\"/orders/:id\",\"method\":\"GET\",\"priority\":10}"

curl -s -X POST $ADMIN_BASE_URL/admin/routing/routes \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$ORDERS_UID\",\"pathPattern\":\"/orders/*\",\"method\":null,\"priority\":5}"

# Payments — strip /payments prefix before forwarding
curl -s -X POST $ADMIN_BASE_URL/admin/routing/routes \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$PAYMENTS_UID\",\"pathPattern\":\"/payments/*\",\"method\":null,\"stripPrefix\":true,\"priority\":10}"
```

---

## Testing Scenarios

### Round-Robin / Weighted Load Balancing

```bash
# Run 20 requests; watch 'instance' field rotate between users-1 and users-2
for i in $(seq 1 20); do
  curl -s http://localhost:8000/users/1 | jq -r '.instance'
done
```

### Timeout Handling

```bash
# This should be cut off by your gateway's upstream timeout
curl -s "http://localhost:8000/users/slow?delay=10000"
```

### Retry on Error

```bash
# Call /error; gateway should retry against the other instance
curl -s http://localhost:8000/users/error
```

### Circuit Breaker

```bash
# Hammer /random-failure at 100% rate to trip circuit breaker
for i in $(seq 1 50); do
  curl -s "http://localhost:8000/users/random-failure?rate=1"
done
```

### JWT / Header Forwarding

```bash
curl -s http://localhost:8000/users/headers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.test" \
  -H "X-Request-Id: $(uuidgen)" \
  -H "X-Correlation-Id: trace-abc" | jq '.headers'
```

### Request Body Proxying

```bash
curl -s -X POST http://localhost:8000/orders/echo \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"ABC","qty":2}],"currency":"USD"}' | jq
```

### Health Check Gating

```bash
# Mark payments-2 unhealthy via admin API, then verify all traffic hits payments-1
curl -s -X PATCH $ADMIN_BASE_URL/admin/routing/service-instances/<payments-2-uid> \
  -H "Content-Type: application/json" \
  -d '{"isHealthy":false}'

for i in $(seq 1 5); do
  curl -s http://localhost:8000/payments/1 | jq -r '.instance'
done
# Should always return: payments-1
```

---

## Adding More Instances

The Compose file uses the shared `*service` anchor, so adding a third instance is two lines:

```yaml
  users-3:
    <<: *service
    container_name: users-3
    ports:
      - "3007:3000"
    environment:
      NODE_ENV: development
      SERVICE_NAME: users
      INSTANCE_NAME: users-3
      PORT: 3000
```

Then register it in the gateway:

```bash
curl -s -X POST $ADMIN_BASE_URL/admin/routing/service-instances \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\",\"host\":\"users-3\",\"port\":3000,\"weight\":1}"
```

---

## Folder Structure

```
mock-services/
├── src/
│   └── service.js          # Single shared service — all 6 containers run this
├── scripts/
│   ├── up.sh               # Start (--rebuild to force image rebuild)
│   ├── down.sh             # Stop and remove containers
│   ├── restart.sh          # Restart all or one: ./restart.sh users-1
│   └── logs.sh             # Tail logs: ./logs.sh [container]
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```
