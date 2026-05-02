#!/bin/bash
# ShopWave — Kubernetes Live Demo Preparation Script
# Usage: chmod +x demo-k8s.sh && ./demo-k8s.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ShopWave — Kubernetes Demo Starting    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Start Minikube ──────────────────────────
echo "▶ [1/6] Starting Minikube..."
minikube start --memory=6144 --cpus=4 --driver=docker
echo "✓ Minikube is ready"
echo ""

# ── 2. Load images to Minikube ─────────────
echo "▶ [2/6] Loading Docker images to Minikube..."
IMAGES=(
  shopwave-api-gateway
  shopwave-auth-service
  shopwave-product-service
  shopwave-order-service
  shopwave-inventory-service
  shopwave-payment-service
  shopwave-shipping-service
  shopwave-notification-service
)

eval $(minikube docker-env)

for img in "${IMAGES[@]}"; do
  echo "  → $img"
  minikube image load "${img}:latest"
done
echo "✓ All images loaded"
echo ""

# ── 3. Apply manifests ─────────────────────
echo "▶ [3/6] Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
echo "✓ Manifests applied"
echo ""

# ── 4. Create databases ──────────────────
echo "▶ [4/6] Creating databases..."
echo "  Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n shopwave-namespace --timeout=120s

POSTGRES_POD=$(kubectl get pods -n shopwave-namespace -l app=postgres -o jsonpath='{.items[0].metadata.name}')
for db in shopwave_auth shopwave_product shopwave_order shopwave_inventory shopwave_payment shopwave_shipping shopwave_notification; do
  kubectl exec -n shopwave-namespace "$POSTGRES_POD" -- psql -U root -d shopwave_db -c "CREATE DATABASE $db;" 2>/dev/null || true
done
echo "✓ Databases are ready"
echo ""

# ── 5. Wait for pods to be ready ──────────
echo "▶ [5/6] Services are starting up (this may take 3-5 mins)..."
kubectl wait --for=condition=ready pod \
  -l app=api-gateway \
  -n shopwave-namespace \
  --timeout=300s 2>/dev/null || true

echo ""

# ── 6. Open port-forwards ─────────────────────────
echo "▶ [6/6] Opening port-forward tunnels..."

# Close existing port-forwards if any
pkill -f "kubectl port-forward" 2>/dev/null || true

kubectl port-forward -n shopwave-namespace service/api-gateway 8080:8080 > /dev/null 2>&1 &
echo "  ✓ API Gateway  → localhost:8080"

kubectl port-forward -n shopwave-namespace service/zipkin 9411:9411 > /dev/null 2>&1 &
echo "  ✓ Zipkin       → localhost:9411"

kubectl port-forward -n shopwave-namespace service/postgres 5432:5432 > /dev/null 2>&1 &
echo "  ✓ PostgreSQL   → localhost:5432  (user: root / pass: root)"

kubectl port-forward -n shopwave-namespace service/product-service 8082:8082 > /dev/null 2>&1 &
echo "  ✓ Product Svc  → localhost:8082  (for seed script)"

echo ""

# ── Show status ─────────────────────────────────
echo "─── PODS ───────────────────────────────────"
kubectl get pods -n shopwave-namespace
echo ""
echo "─── SERVICES ───────────────────────────────"
kubectl get services -n shopwave-namespace
echo ""

echo "╔══════════════════════════════════════════════════════╗"
echo "║  API Gateway  : http://localhost:8080               ║"
echo "║  Zipkin       : http://localhost:9411               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Useful commands:"
echo "  kubectl get pods -n shopwave-namespace"
echo "  kubectl logs <pod-name> -n shopwave-namespace"
echo "  kubectl describe pod <pod-name> -n shopwave-namespace"
echo ""
