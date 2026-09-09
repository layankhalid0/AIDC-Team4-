# HPA Failure Analysis

1. The CPU-based HPA works for the echo backend because that workload is CPU-bound, but it fails for the real vLLM engine because inference is mainly GPU-bound. During our load test, the vLLM pod used only about 57m CPU while GPU utilization reached 92%. Therefore, CPU utilization does not represent the real serving pressure.

2. I would use `vllm_num_requests_waiting` as the scaling signal instead. Queue depth directly shows when incoming requests are waiting because the engine cannot serve them fast enough.

3. I would start with a small queue-depth threshold and then tune it while monitoring p95 latency, throughput, GPU utilization, and the number of waiting requests.
