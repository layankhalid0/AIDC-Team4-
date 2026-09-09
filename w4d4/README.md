
# Team Serving Deployment (W4D4) - Team 4

This repository contains the deployment configurations and validation scripts for the team serving application (`W4D4`), optimized and stabilized for Kubernetes cluster execution.

## 🚀 Overview
The objective of this phase is to deploy the team serving service using Helm charts, ensuring proper resource allocation, stable Horizontal Pod Autoscaling (HPA), and successful verification against the team's automated testing suite.

## 🛠️ Prerequisites & Environment
- Kubernetes Cluster / Minikube
- Helm 3 installed
- Docker container runtime
- WSL2 / Ubuntu terminal environment

## 📦 Deployment Instructions

1. **Navigate to the Directory:**
   ```bash
   cd d4
   

2. **Deploy the Helm Release:**
   Ensure the Helm release is named `team` and deployed inside the `team` namespace to satisfy the test requirements:
   ```bash
   helm upgrade --install team ./helm/team-serving --namespace team --create-namespace

## 📸 Verification & Results

### Deployment Status (Not Live Yet Check)
> The service is successfully deployed and reachable, awaiting the official Go-live phase.

<img width="1320" height="2737" alt="IMG_5876" src="https://github.com/user-attachments/assets/b540ba5f-a3fd-4763-be4a-ef9e713566d5" />


### 2. Verification Success
> Successful execution of `./verify.sh` showing `GREEN CHECK: PASS`.

<img width="940" height="138" alt="Screenshot 2026-09-09 161426" src="https://github.com/user-attachments/assets/f860b239-43bf-4620-afb6-53b9038cb0db" />  

## ⚙️ Configuration & Adjustments

- **Resource Tuning:** Resource limits and requests have been configured to prevent `OOMKilled` errors under load.
- **Namespace Isolation:** All resources reside strictly within the `team` namespace.
