import torch
import onnxruntime as ort

print("--- GPU Debug Info ---")
try:
    print(f"Torch CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"Torch Device: {torch.cuda.get_device_name(0)}")
except ImportError:
    print("Torch not installed.")

print(f"\nONNX Runtime Providers: {ort.get_available_providers()}")
