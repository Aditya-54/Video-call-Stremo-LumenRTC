import os
import multiprocessing
import onnxruntime as ort

class HardwareTier:
    TIER_1_RTX = "Tier 1: RTX GPU (Maxine/TensorRT)"
    TIER_2_HIGH_CPU = "Tier 2: High-Performance CPU (ONNX AVX2)"
    TIER_3_NORMAL_CPU = "Tier 3: Standard CPU (Basic Filters)"

class HardwareProvider:
    @staticmethod
    def get_capabilities():
        specs = {
            "tier": HardwareTier.TIER_3_NORMAL_CPU,
            "cpu_cores": multiprocessing.cpu_count(),
            "has_cuda": False,
            "gpu_name": "None"
        }

        # 1. Check for CUDA via ONNX Runtime
        providers = ort.get_available_providers()
        if 'CUDAExecutionProvider' in providers:
            specs["has_cuda"] = True
            specs["tier"] = HardwareTier.TIER_1_RTX
            specs["gpu_name"] = "CUDA Capable GPU" # ONNX Runtime doesn't easily give name without session
            
            # Try to get more info via nvidia-smi if available (optional)
            try:
                import subprocess
                result = subprocess.run(['nvidia-smi', '-L'], stdout=subprocess.PIPE, text=True)
                if result.returncode == 0:
                    specs["gpu_name"] = result.stdout.strip().split('\n')[0]
            except:
                pass

        # 2. Check CPU if no GPU
        if not specs["has_cuda"]:
            # Threshold: Using 12 logical cores as the split point
            if specs["cpu_cores"] > 12:
                specs["tier"] = HardwareTier.TIER_2_HIGH_CPU
            else:
                specs["tier"] = HardwareTier.TIER_3_NORMAL_CPU

        return specs

if __name__ == "__main__":
    print("Probing Hardware...")
    specs = HardwareProvider.get_capabilities()
    print(f"Cores: {specs['cpu_cores']}")
    print(f"CUDA: {specs['has_cuda']}")
    print(f"GPU: {specs['gpu_name']}")
    print(f"Detected: {specs['tier']}")
