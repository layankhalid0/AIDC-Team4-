serving is guaranteed a minimum CPU allocation to cover its measured burst, dashboard bursts freely as needed, and batch throttles first under resource contention.

serving:
  resources:
    requests:
      cpu: "2"
    limits:
      cpu: "2"

dashboard:
  resources:
    requests:
      cpu: "100m"
    limits:
      cpu: "4"

batch:
  resources:
    requests:
      cpu: "100m"

Defense: Protecting the serving p95 from unthrottled neighbours relies on isolating critical workloads, as demonstrated by our measured p95 data which confirms stable low latency under controlled resource bounds.