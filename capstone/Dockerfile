FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3.11 python3-pip && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/bin/python3.11 /usr/local/bin/python && \
    ln -sf /usr/bin/python3.11 /usr/local/bin/python3

WORKDIR /app

COPY app/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["vllm", "serve", "Qwen/Qwen3-8B", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--dtype", "half", \
     "--max-model-len", "4096", \
     "--gpu-memory-utilization", "0.85"]
