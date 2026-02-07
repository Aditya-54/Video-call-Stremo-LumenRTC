import subprocess
import time
import sys

def run_p2p_test():
    print("Starting P2P Simulation...")
    
    # Start Joiner
    print("Launching Joiner...")
    joiner = subprocess.Popen(
        [sys.executable, "python_src/main.py", "joiner"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    time.sleep(2) # Wait for Joiner to connect and join room

    # Start Host
    print("Launching Host...")
    host = subprocess.Popen(
        [sys.executable, "python_src/main.py", "host"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    # Monitor loop
    start_time = time.time()
    try:
        while time.time() - start_time < 15: # Run for 15 seconds
            # Check Host Output
            line = host.stdout.readline()
            if line: print(f"[HOST]: {line.strip()}")
            
            # Check Joiner Output
            line = joiner.stdout.readline()
            if line: print(f"[JOINER]: {line.strip()}")
            
            if host.poll() is not None or joiner.poll() is not None:
                break
                
    except KeyboardInterrupt:
        pass
    finally:
        print("Stopping processes...")
        host.terminate()
        joiner.terminate()
        host.wait()
        joiner.wait()
        print("Test Complete.")

if __name__ == "__main__":
    run_p2p_test()
