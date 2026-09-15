# Saudi Data Centre Site Check — HUMAIN Dammam
# We chose HUMAIN Dammam, announced at up to 100 MW initial capacity
## Assumptions:
- PUE = 1.25
- 10% of IT power is used for switches and storage
- 20% headroom
- DGX H100 node = 8 GPUs, 640 GB total GPU memory, 10.2 kW
- 4 DGX H100 nodes per rack
- H100 peak performance = 989 TFLOPS, with 40% sustained for training
- Training state = about 16 bytes per parameter
- 30-day month
- Average site draw = 65% of connection
- Industrial electricity rate = $0.048/kWh
- Serving throughput = 125 output tokens/s/GPU
- Non-electric cost = $450,000 per MW per month
# The five questions

1. How many racks and GPUs does the site's power buy?

First, calculate power available for compute:
100 MW / 1.25 = 80 MW IT power
80 × 0.90 = 72 MW after switches and storage
72 × 0.80 = 57.6 MW for compute
Each DGX H100 node uses 10.2 kW:
57,600 kW / 10.2 kW = 5,647 nodes
Each node has 8 GPUs:
5,647 × 8 = 45,176 H100 GPUs
Each rack holds 4 nodes:
5,647 / 4 = 1,412 racks

Final answer: about 1,412 racks and 45,176 H100 GPUs

2. What is the largest open model it can serve, and how many copies of it?

We use Kimi K2, approximately 1 trillion parameters
From the lecture example:
- Weights = 1 TB
- Context for a few dozen long conversations = 0.3 TB
- Total serving memory = 1.3 TB
Each H100 has 80 GB:
1,300 GB / 80 GB = 16.25 -> about 17 GPUs per copy
45,176 / 17 = 2,657 copies

Final answer: Kimi K2 (~1T parameters), with theoretical memory-sized capacity about 2,657 copies

3. What is the largest model it could train in six months?

Training compute follows:
Compute = 6 × N × 20N = 120N²

Available six-month compute:
45,176 × 989 TFLOPS × 40% × 15.8 million seconds = 2.82 × 10^26 operations

This gives a compute limit of:
N = sqrt((2.82 × 10^26) / 120) = 1.53 trillion parameters
However, training also needs about 16 bytes per parameter

Total GPU memory:
45,176 × 80 GB = 3,614,080 GB

Memory limit:
3,614,080 GB / 16 bytes per parameter = 226 billion parameters

Since memory is the tighter constraint:
Training tokens = 20 × 226B = 4.52T tokens

Final answer: about a 226B-parameter model on about 4.52T tokens

4. What is its electricity bill for a month?

The Dammam site has a 100 MW connection and draws 65% of it on average

Average power draw:
100 MW × 0.65 = 65 MW

Assuming a 30-day month:
65 MW × 24 hours × 30 days = 46,800 MWh = 46.8 million kWh

At $0.08/kWh:
46.8M × $0.08 = $3.744M per month

At the industrial rate of $0.048/kWh:
46.8M × $0.048 = $2.246M per month

Final answer: About $3.74 million per month, or about $2.25 million per month at the industrial rate

5. What does a million tokens cost, at 30% and at 80% of capacity sold?

Each GPU produces 125 output tokens per second

For a 30-day month:
45,176 × 125 × 2,592,000 = 14.64 trillion tokens/month

The non-electric monthly cost is:
100 MW × $450,000 = $45,000,000 per month

Adding the electricity cost from Question 4:
$45,000,000 + $3,744,000 = $48,744,000 per month

At 30% capacity sold:
14.64T × 0.30 = 4.39T tokens
$48.744M ÷ 4.39M = $11.10 per 1M tokens

At 80% capacity sold:
14.64T × 0.80 = 11.71T tokens

$48.744M ÷ 11.71M = $4.16 per 1M tokens

Final answer: About $11.10 per million tokens at 30% capacity sold, and about $4.16 per million tokens at 80% capacity sold