Serving is guaranteed to protect the p95 SLO, dashboard is allowed to burst for short refresh spikes, and batch throttles first because it has no deadline today.

serving:
  resources:
    requests:
      cpu: 1
      memory: 512Mi
    limits:
      cpu: 1
      memory: 512Mi

batch:
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

dashboard:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi

Batch is the loser because it has no deadline today; in our measured runs the serving p95 was 4ms with unlimited neighbours and 4ms with 500m-limited neighbours.
