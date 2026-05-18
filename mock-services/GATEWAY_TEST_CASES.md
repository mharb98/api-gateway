# Gateway Test Cases — Mock Services Lab

Test cases for wiring the local `gateway-lab` containers into the API gateway.
Run `./scripts/up.sh` before executing any of these.

Set your gateway base URL once and reuse it throughout:

```bash
export GW="http://localhost:8000"   # adjust to your gateway port
export ADMIN="$GW/admin/routing"
```

---

## Step 1 — Create Services

One service record per mock service. All use `http` since the containers speak plain HTTP.

### 1.1 Users

```bash
USERS_UID=$(curl -sf -X POST "$ADMIN/services" \
  -H "Content-Type: application/json" \
  -d '{"name":"users","protocol":"http"}' | jq -r '.uid')
echo "users uid: $USERS_UID"
```

### 1.2 Orders

```bash
ORDERS_UID=$(curl -sf -X POST "$ADMIN/services" \
  -H "Content-Type: application/json" \
  -d '{"name":"orders","protocol":"http"}' | jq -r '.uid')
echo "orders uid: $ORDERS_UID"
```

### 1.3 Payments

```bash
PAYMENTS_UID=$(curl -sf -X POST "$ADMIN/services" \
  -H "Content-Type: application/json" \
  -d '{"name":"payments","protocol":"http"}' | jq -r '.uid')
echo "payments uid: $PAYMENTS_UID"
```

### Service validation cases

| # | What to send | Expected |
|---|--------------|----------|
| SVC-V-01 | `{}` (no name) | 400 |
| SVC-V-02 | `{"name":""}` | 400 |
| SVC-V-03 | `{"name":"users"}` again after step 1.1 | 409 conflict |
| SVC-V-04 | `{"name":"x","protocol":"ftp"}` | 400 invalid enum |
| SVC-V-05 | `{"name":"aaaa..."}` (101 chars) | 400 maxLength |

---

## Step 2 — Create Service Instances

The gateway runs on the host machine, so use `localhost` with each container's mapped port.

### 2.1 Users instances

```bash
# users-1 — primary, higher weight  (mapped to localhost:3001)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$USERS_UID\",
    \"host\": \"localhost\",
    \"port\": 3001,
    \"weight\": 2,
    \"isHealthy\": true
  }" | jq .

# users-2 — secondary, lower weight  (mapped to localhost:3002)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$USERS_UID\",
    \"host\": \"localhost\",
    \"port\": 3002,
    \"weight\": 1,
    \"isHealthy\": true
  }" | jq .
```

### 2.2 Orders instances

```bash
# orders-1  (mapped to localhost:3003)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$ORDERS_UID\",
    \"host\": \"localhost\",
    \"port\": 3003,
    \"weight\": 1,
    \"isHealthy\": true
  }" | jq .

# orders-2  (mapped to localhost:3004)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$ORDERS_UID\",
    \"host\": \"localhost\",
    \"port\": 3004,
    \"weight\": 1,
    \"isHealthy\": true
  }" | jq .
```

### 2.3 Payments instances

```bash
# payments-1 — healthy  (mapped to localhost:3005)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$PAYMENTS_UID\",
    \"host\": \"localhost\",
    \"port\": 3005,
    \"weight\": 1,
    \"isHealthy\": true
  }" | jq .

# payments-2 — starts UNHEALTHY (tests health-check gating)  (mapped to localhost:3006)
curl -sf -X POST "$ADMIN/service-instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceUid\": \"$PAYMENTS_UID\",
    \"host\": \"localhost\",
    \"port\": 3006,
    \"weight\": 1,
    \"isHealthy\": false
  }" | jq .
```

### Instance validation cases

| # | What to send | Expected |
|---|--------------|----------|
| SI-V-01 | No `serviceUid` field | 400 |
| SI-V-02 | `serviceUid` is not a valid UUID | 400 |
| SI-V-03 | `serviceUid` is a UUID that doesn't exist | 404 |
| SI-V-04 | No `host` field | 400 |
| SI-V-05 | `host` is empty string | 400 |
| SI-V-06 | `host` is 256 chars | 400 maxLength |
| SI-V-07 | No `port` field | 400 |
| SI-V-08 | `port: 0` | 400 below min |
| SI-V-09 | `port: 65536` | 400 above max |
| SI-V-10 | `port: 443.5` (float) | 400 must be integer |
| SI-V-11 | `weight: 0` | 400 below min |
| SI-V-12 | `weight: 1.5` (float) | 400 must be integer |

---

## Step 3 — Create Routes

### Route design

The mock containers expose endpoints at their **root** (e.g. `/health`, `/slow`).
The gateway receives requests under a **service prefix** (e.g. `/users/health`).

Two patterns are used:

| Pattern type | Example gateway path | `stripPrefix` | Upstream receives |
|---|---|---|---|
| Utility/simulation | `/users/health` | `true` | `/health` |
| Resource (parameterised) | `/users/:id` | `false` | `/users/42` → matches `/:resource/:id` |

Utility routes get **priority 50** so the prefix-tree router picks them before the parameterised
`:id` route (priority 20) when both could match.

---

### 3.1 Users routes

```bash
# Health probe
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/health\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Instance info
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/info\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Resource lookup — GET /users/:id
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/:id\",
  \"method\":       \"GET\",
  \"stripPrefix\":  false,
  \"priority\":     20
}" | jq .

# Slow response (timeout testing)
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/slow\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Always-500 (retry / error handling testing)
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/error\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Random failure (circuit-breaker testing)
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/random-failure\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Header echo (JWT / tracing header forwarding)
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/headers\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Echo — all methods (body proxy testing)
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$USERS_UID\",
  \"pathPattern\":  \"/users/echo\",
  \"method\":       null,
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .
```

---

### 3.2 Orders routes

```bash
# Health
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/health\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Info
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/info\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Resource lookup — GET /orders/:id
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/:id\",
  \"method\":       \"GET\",
  \"stripPrefix\":  false,
  \"priority\":     20
}" | jq .

# Slow
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/slow\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Error
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/error\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Random failure
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/random-failure\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Headers
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/headers\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Echo — all methods
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$ORDERS_UID\",
  \"pathPattern\":  \"/orders/echo\",
  \"method\":       null,
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .
```

---

### 3.3 Payments routes

```bash
# Health
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/health\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Info
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/info\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Resource lookup — GET /payments/:id
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/:id\",
  \"method\":       \"GET\",
  \"stripPrefix\":  false,
  \"priority\":     20
}" | jq .

# Slow
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/slow\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Error
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/error\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Random failure
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/random-failure\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Headers
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/headers\",
  \"method\":       \"GET\",
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .

# Echo — all methods
curl -sf -X POST "$ADMIN/routes" -H "Content-Type: application/json" -d "{
  \"serviceUid\":   \"$PAYMENTS_UID\",
  \"pathPattern\":  \"/payments/echo\",
  \"method\":       null,
  \"stripPrefix\":  true,
  \"priority\":     50
}" | jq .
```

### Route validation cases

| # | What to send | Expected |
|---|--------------|----------|
| RT-V-01 | No `serviceUid` | 400 |
| RT-V-02 | `serviceUid` not a UUID | 400 |
| RT-V-03 | `serviceUid` UUID that doesn't exist | 404 |
| RT-V-04 | No `pathPattern` | 400 |
| RT-V-05 | `pathPattern: ""` | 400 |
| RT-V-06 | `pathPattern` over 255 chars | 400 maxLength |
| RT-V-07 | Non-terminal wildcard: `/users/*/detail` | 400 |
| RT-V-08 | Non-terminal wildcard: `/use*s/id` | 400 |
| RT-V-09 | `method: "FETCH"` (not a valid HTTP method) | 400 |
| RT-V-10 | `priority: "high"` (not a number) | 400 |

---

## Step 4 — End-to-End Verification

Once the gateway has loaded the routes, verify each one returns actual data from the mock service.
Every response includes `service` and `instance` fields — check them to confirm the right container answered.

### 4.1 Users

```bash
# Health — expect: service=users, status=healthy
curl -s $GW/users/health | jq '{service,instance,status}'

# Info — expect: service=users, pid and uptime present
curl -s $GW/users/info | jq '{service,instance,pid,uptime}'

# Resource — expect: service=users, data.resource=users, data.id=42
curl -s $GW/users/42 | jq '{service,instance,data}'

# Slow — default 2s delay; expect delay_ms=2000
curl -s "$GW/users/slow" | jq '{service,instance,delay_ms}'

# Slow with custom delay
curl -s "$GW/users/slow?delay=500" | jq '{service,instance,delay_ms}'

# Error — expect HTTP 500
curl -sv $GW/users/error 2>&1 | grep "< HTTP"

# Random failure at 80% rate
curl -s "$GW/users/random-failure?rate=0.8" | jq '{service,instance}'

# Headers — verify gateway injects standard headers
curl -s $GW/users/headers \
  -H "Authorization: Bearer test-token" \
  -H "X-Request-Id: req-test-001" | jq '.headers | {authorization,"x-request-id"}'

# Echo — POST with body
curl -s -X POST $GW/users/echo \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","action":"login"}' | jq '{service,instance,body}'
```

### 4.2 Orders

```bash
curl -s $GW/orders/health | jq '{service,instance,status}'
curl -s $GW/orders/info   | jq '{service,instance,uptime}'
curl -s $GW/orders/99     | jq '{service,instance,data}'
curl -s "$GW/orders/slow?delay=300" | jq '{service,instance,delay_ms}'
curl -sv $GW/orders/error 2>&1 | grep "< HTTP"

curl -s -X POST $GW/orders/echo \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"ABC","qty":2}]}' | jq '{service,instance,body}'
```

### 4.3 Payments

```bash
curl -s $GW/payments/health | jq '{service,instance,status}'
curl -s $GW/payments/info   | jq '{service,instance,uptime}'
curl -s $GW/payments/7      | jq '{service,instance,data}'

# payments-2 is unhealthy — this should ONLY ever return instance=payments-1
for i in $(seq 1 5); do curl -s $GW/payments/health | jq -r '.instance'; done

curl -s -X POST $GW/payments/echo \
  -H "Content-Type: application/json" \
  -d '{"orderId":"o_123","amount":49.99}' | jq '{service,instance,body}'
```

---

## Step 5 — Load-Balancing Smoke Tests

### 5.1 Users — weighted round-robin (2:1 ratio)

```bash
# Expect users-1 to appear roughly twice as often as users-2
for i in $(seq 1 12); do
  curl -s $GW/users/health | jq -r '.instance'
done
```

Expected distribution (approximate): `users-1` × 8, `users-2` × 4.

### 5.2 Orders — equal weights

```bash
# Expect roughly even split between orders-1 and orders-2
for i in $(seq 1 10); do
  curl -s $GW/orders/health | jq -r '.instance'
done
```

### 5.3 Payments — health-check gating (single healthy instance)

```bash
# All requests must land on payments-1 (payments-2 is isHealthy=false)
for i in $(seq 1 5); do
  curl -s $GW/payments/health | jq -r '.instance'
done
# Expected: payments-1 every time
```

### 5.4 Restore payments-2 and re-verify split

```bash
# Fetch the UID for payments-2 instance first, then:
curl -sf -X PATCH "$ADMIN/service-instances/<payments-2-uid>" \
  -H "Content-Type: application/json" \
  -d '{"isHealthy":true}' | jq .

# Now traffic should split across both payments instances
for i in $(seq 1 6); do
  curl -s $GW/payments/health | jq -r '.instance'
done
```

---

## Step 6 — Route Update Cases

### 6.1 Disable / re-enable a route

```bash
# Disable the users resource route
curl -sf -X PATCH "$ADMIN/routes/<users-id-route-uid>" \
  -H "Content-Type: application/json" \
  -d '{"isEnabled":false}' | jq .

# Verify gateway no longer routes it (expect 404 or passthrough)
curl -sv $GW/users/42 2>&1 | grep "< HTTP"

# Re-enable
curl -sf -X PATCH "$ADMIN/routes/<users-id-route-uid>" \
  -H "Content-Type: application/json" \
  -d '{"isEnabled":true}' | jq .

curl -s $GW/users/42 | jq '{service,instance}'
```

### 6.2 Change priority — promote slow route above resource route

```bash
# Lower the resource route priority so /users/slow takes clear precedence
curl -sf -X PATCH "$ADMIN/routes/<users-slow-route-uid>" \
  -H "Content-Type: application/json" \
  -d '{"priority":100}' | jq .
```

### 6.3 Move a route to a different service

```bash
# Re-assign orders /orders/health to point at users service instead
curl -sf -X PATCH "$ADMIN/routes/<orders-health-route-uid>" \
  -H "Content-Type: application/json" \
  -d "{\"serviceUid\":\"$USERS_UID\"}" | jq .

# Verify: response now shows service=users
curl -s $GW/orders/health | jq '{service,instance}'
```

---

## Quick-Reference: Container Direct Access

Bypass the gateway to confirm containers are alive independently:

```bash
curl -s http://localhost:3001/health | jq '{service,instance}'   # users-1
curl -s http://localhost:3002/health | jq '{service,instance}'   # users-2
curl -s http://localhost:3003/health | jq '{service,instance}'   # orders-1
curl -s http://localhost:3004/health | jq '{service,instance}'   # orders-2
curl -s http://localhost:3005/health | jq '{service,instance}'   # payments-1
curl -s http://localhost:3006/health | jq '{service,instance}'   # payments-2

# Resource endpoints
curl -s http://localhost:3001/users/42   | jq .data
curl -s http://localhost:3003/orders/99  | jq .data
curl -s http://localhost:3005/payments/7 | jq .data

# Failure simulation (direct)
curl -s "http://localhost:3001/slow?delay=500" | jq '{instance,delay_ms}'
curl -s http://localhost:3001/error             | jq '{instance}'
curl -s "http://localhost:3001/random-failure?rate=1" | jq '{instance}'
```
