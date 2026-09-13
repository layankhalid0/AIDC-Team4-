# slo-targets

## Service indicators and proposed targets

Team: Team 4
Use case: OpenAI-compatible chat model serving for the Agentic AI project; the service provides model inference infrastructure for the agent team.
Service measured: Qwen/Qwen2.5-1.5B-Instruct-AWQ, vLLM serving endpoint, team namespace; baseline serving deployment.
Workload: 120 chat requests, max_tokens=64, single caller followed by up to four callers.
Measurement period: 2026-09-13 08:04:22 to 08:07:22 UTC (11:04:22 to 11:07:22 Saudi Arabia time).
Instrumentation gaps: End-user request success and client-side latency are not directly measured; current indicators rely on Prometheus scrape health and vLLM server metrics.

## SLI 1

Indicator: 95th percentile time to first token (p95 TTFT)
Panel: p95 Time to First Token
Unit: seconds
Target: <= 0.10 seconds over the SLO window; provisional target based on the short workload.
Window: Prometheus query window [5m]; proposed SLO window: 30 minutes.
Observed: 0.039 seconds (39 ms) during the 120-request workload with max_tokens=64.
Evidence: Prometheus query using histogram_quantile(0.95) over vllm:time_to_first_token_seconds_bucket with rate window [5m], measured on 2026-09-13.
Why it fits: TTFT measures how quickly users receive the first generated token and therefore directly reflects perceived responsiveness of the chat service.
Limitations: The measurement covers only a short 120-request workload and server-side TTFT; it does not include network or client-side latency. The target is provisional and needs retesting with longer sustained workloads and representative concurrency.

## SLI 2

Indicator: Successful Prometheus scrape percentage
Panel: Scrape Success
Unit: percent
Target: >= 99%; diagnostic/operational threshold rather than a direct user-outcome SLO.
Window: Prometheus query window [1h]; diagnostic target evaluated over the available measurement period.
Observed: 100% during the measurement period.
Evidence: Prometheus query 100 * avg_over_time(up{job="serving"}[1h]), measured on 2026-09-13.
Why it fits: Successful scrapes confirm that Prometheus can reach and collect metrics from the serving service, providing an operational diagnostic signal for monitoring health.
Limitations: A successful scrape does not guarantee successful end-user requests. The observation covers a short period and should be retested over a longer production-like window before treating the threshold as stable.


