#!/usr/bin/env bash
set -u

CLUSTER="${CLUSTER:-k3s}"
POD="${POD:-serving}"
PORT=18441
PF_PID=""

fail() { echo "GREEN CHECK: FAIL ($1)"; [ -n "$PF_PID" ] && kill "$PF_PID" 2>/dev/null; exit 1; }

command -v kubectl >/dev/null || fail "kubectl not on PATH"
kubectl cluster-info >/dev/null 2>&1 || fail "kubectl cannot connect to cluster"

phase=$(kubectl get pod "$POD" -n remas -o jsonpath='{.status.phase}' 2>/dev/null) \
  || fail "no pod named '$POD' in namespace remas"
[ "$phase" = "Running" ] || fail "pod is $phase, not Running"

ready=$(kubectl get pod "$POD" -n remas -o jsonpath='{.status.containerStatuses[0].ready}')
[ "$ready" = "true" ] || fail "pod is Running but not Ready"

image=$(kubectl get pod "$POD" -n remas -o jsonpath='{.spec.containers[0].image}')
echo "pod image: $image"

kubectl port-forward -n remas "pod/$POD" "$PORT:8000" >/dev/null 2>&1 &
PF_PID=$!
up=""
for _ in $(seq 1 25); do
  if curl -sf "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then up=1; break; fi
  sleep 0.5
done
[ -n "$up" ] || fail "port-forward opened but /health never answered"

model_id="Qwen/Qwen2.5-0.5B-Instruct"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:$PORT/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"$model_id\",\"messages\":[{\"role\":\"user\",\"content\":\"green check\"}]}")
case "$code" in
  200|401|404|422) : ;;
  *) fail "/v1/chat/completions answered $code through the cluster" ;;
esac

kill "$PF_PID" 2>/dev/null; PF_PID=""

node=$(kubectl get pod "$POD" -n remas -o jsonpath='{.spec.nodeName}')
cat > w4d1_evidence.json <<DOC_EOF
{"cluster": "k3s", "pod": "$POD", "image": "$image", "node": "$node", "chat_status": $code}
DOC_EOF

echo "evidence written to w4d1_evidence.json"
echo "GREEN CHECK: PASS"
