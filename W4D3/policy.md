Policy: The serving workload is Guaranteed to protect its latency SLO, the batch workload is Burstable but throttles first under CPU pressure, and the dashboard runs as BestEffort using spare resources.

serving:
  resources:
    requests:
      cpu: "1"
      memory: 4Gi
    limits:
      cpu: "1"
      memory: 4Gi

batch:
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

dashboard:
  resources: {}

Evidence: The serving p95 improved from 4 ms with an unlimited CPU neighbour to 3 ms when the neighbour was limited to 500m, so the batch workload is the first workload to throttle.
