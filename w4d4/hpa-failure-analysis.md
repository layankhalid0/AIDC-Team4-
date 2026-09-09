### 1. Where today's scaler fails on the real engine
The current HPA relies on CPU utilization metrics. Because vLLM is heavily GPU-bound, the engine processes requests and saturates the GPU (reaching high GPU utilization) while its CPU usage remains at a low single-digit percentage (e.g., around 5% of its allocated CPU limits). As a result, during a heavy traffic surge where the request queue fills up, the CPU-based HPA reads normal or low CPU usage and incorrectly keeps the deployment locked at a single replica, causing severe latency and outages.

### 2. The signal to deploy instead
Instead of CPU, the scaler should monitor metrics that reflect the actual workload pressure on the inference engine, such as:
- **`vllm_num_requests_waiting` (Engine Queue Depth):** Directly shows how many requests are piling up and waiting for processing, capturing traffic spikes immediately.
- **KV-Cache Utilization:** Shows memory strain on the GPU during heavy sequence generation.

### 3. Target number and tuning approach
- **Target Metric:** `vllm_num_requests_waiting`
- **Initial Target Threshold:** Start with an average of **5 to 10 waiting requests** per replica. If the waiting queue consistently exceeds this threshold, it triggers a scale-out event.
- **What to watch:** Monitor request latency (Time to First Token and inter-token latency) alongside pod scaling events to ensure the threshold prevents queue buildup without causing excessive thrashing or over-provisioning.
