# HPA Failure Analysis

1. CPU-based HPA can fail to represent the real load of a vLLM inference engine. During the load test, CPU usage was only 17m while vLLM was using about 41.9 GiB of GPU memory. This shows that CPU utilization alone may not reflect GPU inference workload or request pressure.

2. Better scaling signals include the number of in-flight or waiting requests, `vllm_num_requests_waiting`, and KV-cache utilization. These metrics are more directly related to inference queue pressure and GPU memory usage.

3. A reasonable starting target is to keep request queue pressure low and tune the HPA using waiting requests or KV-cache utilization rather than CPU usage alone. The target should then be adjusted based on observed latency and workload behavior.
