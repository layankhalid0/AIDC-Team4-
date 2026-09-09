1. Today's CPU-based scaler fails on the real vLLM engine because GPU is the main bottleneck. CPU usage can stay relatively low while the GPU is heavily loaded and requests are waiting.

2. I would use engine queue depth, vllm_num_requests_waiting, because it directly shows how many requests are waiting for the GPU and reflects serving pressure better than CPU utilization.

3. I would start with a target queue depth of around 5 waiting requests. I would watch queue depth, TTFT, throughput, and GPU utilization to tune the target.
