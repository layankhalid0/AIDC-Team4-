# AIDC Bootcamp - Week 4 Day 3 (w4d3) 🚀

## Overview
This repository documents the workflow, deployment configurations, and verification steps for **Week 4, Day 3 (w4d3)** of the AIDC Bootcamp. The focus is on Kubernetes resource management, Quality of Service (QoS) policies, shared namespace setup, and the deployment of a GPU-backed vLLM engine.

---

## Step-by-Step Implementation 🛠️

### Step 1-4: Environment & Setup
*   Initialized local workspace environment.
*   Configured access permissions and namespace contexts (`remas` and `team`).

### Step 5: Policy Documentation (`policy.md`)
*   Defined resource requests and limits to ensure correct QoS classification.
*   Established QoS tiering:
    *   **Guaranteed**: Critical serving workloads (requests equal limits).
    *   **Burstable**: Workloads with flexible resource allocation.
    *   **BestEffort**: Batch or unconstrained tasks.
*   Documented defense strategies for maintaining optimal p95 latency.

### Step 6: Team vLLM Engine Deployment
*   Created and configured the shared `team` namespace.
*   Generated and deployed the API key secret (`serving-keys`) securely.
*   Applied `vllm-gpu.yaml` using the **Qwen/Qwen2.5-1.5B-Instruct-AWQ** model with canon flags (`--dtype half`, `--max-model-len 4096`, `--gpu-memory-utilization 0.85`).
*   Verified that the vLLM pod reached `1/1 Running` status with `Guaranteed` QoS.

### Step 7: Final Verification
*   Executed local and cross-namespace validation scripts.
*   Confirmed successful integration and system health checks.

---

## Verification & Proof of Success 📸

<img width="1482" height="175" alt="Screenshot 2026-09-08 162133" src="https://github.com/user-attachments/assets/163618d4-1cfd-4c96-8cfc-2d61afcebb0a" />

---
*Developed by Team 4* ✨
