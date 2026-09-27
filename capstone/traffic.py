import requests
import time
import concurrent.futures

URL = "http://127.0.0.1:30800/v1/chat/completions"
MODEL = "Qwen/Qwen3-8B-AWQ"

payload = {
    "model": MODEL,
    "messages": [
        {
            "role": "user",
            "content": "Teach me one simple Arabic phrase and explain its meaning in English."
        }
    ],
    "max_tokens": 64,
}

def send_request(i):
    start = time.time()

    try:
        r = requests.post(URL, json=payload, timeout=60)
        elapsed = time.time() - start

        if r.status_code == 200:
            return i, True, elapsed
        else:
            return i, False, elapsed

    except Exception as e:
        return i, False, time.time() - start


def run_traffic(concurrency, duration):
    print(f"\nStarting traffic: concurrency={concurrency}, duration={duration}s")

    start_time = time.time()
    results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        while time.time() - start_time < duration:
            futures = [
                executor.submit(send_request, i)
                for i in range(concurrency)
            ]

            for future in concurrent.futures.as_completed(futures):
                results.append(future.result())

    return results


if __name__ == "__main__":
    utc_start = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    print("Traffic start:", utc_start)

    results = []

    # Phase 1: one caller for 60 seconds
    results += run_traffic(concurrency=1, duration=60)

    print("\n30-second pause...")
    time.sleep(30)

    # Phase 2: four concurrent callers for 60 seconds
    results += run_traffic(concurrency=4, duration=60)

    utc_end = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())

    successful = sum(1 for _, ok, _ in results if ok)
    failed = len(results) - successful

    print("\nTraffic finished")
    print("UTC start:", utc_start)
    print("UTC end:", utc_end)
    print("Total requests:", len(results))
    print("Successful:", successful)
    print("Failed:", failed)

