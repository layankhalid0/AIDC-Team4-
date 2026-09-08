Serving is guaranteed with resources reserved for its burst, dashboard is allowed to burst, and batch throttles first when CPU is constrained.

Serving:

```yaml
resources:
  requests:
    cpu: "1"
    memory: 512Mi
  limits:
    cpu: "1"
    memory: 512Mi
```

Batch:

```yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

Dashboard:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

The batch workload is the loser because it throttles first; our measurements showed p95 latency of 4ms with an unlimited neighbour versus 3ms with the neighbour limited to 500m CPU.

