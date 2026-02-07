import cv2
import time
import asyncio
from av import VideoFrame
from aiortc import VideoStreamTrack
import numpy as np
from hardware_probe import HardwareTier

class MediaPipelineTrack(VideoStreamTrack):
    def __init__(self, hardware_specs):
        super().__init__()
        self.hardware_specs = hardware_specs
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FPS, 15)
        self.tier = hardware_specs['tier']
        self.frame_count = 0
        print(f"Media Pipeline Initialized on Tier: {self.tier}")

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        
        ret, frame = self.cap.read()
        if not ret:
            # Return a black frame if capture fails
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        start_time = time.time()
        
        # Processing Logic based on Tier
        processed_frame = self.process_frame(frame)
        
        end_time = time.time()
        process_time_ms = (end_time - start_time) * 1000
        
        # Overlay Stats
        cv2.putText(processed_frame, f"Tier: {self.tier}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(processed_frame, f"Proc Time: {process_time_ms:.2f}ms", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        if self.frame_count % 30 == 0:
            print(f"[PERF] Frame {self.frame_count}: {process_time_ms:.2f} ms")
        self.frame_count += 1
        
        # Show local loopback window
        cv2.imshow("LumenRTC Local Loopback", processed_frame)
        cv2.waitKey(1)
        
        # Convert to av.VideoFrame for WebRTC
        new_frame = VideoFrame.from_ndarray(processed_frame, format="bgr24")
        new_frame.pts = pts
        new_frame.time_base = time_base
        return new_frame

    def process_frame(self, frame):
        if self.tier == HardwareTier.TIER_3_NORMAL_CPU:
            # Basic Filter: Gaussian Blur to simulate "denoising"
            return cv2.GaussianBlur(frame, (5, 5), 0)
        elif self.tier == HardwareTier.TIER_2_HIGH_CPU:
            # High CPU: Bilateral Filter (slower, better quality)
            return cv2.bilateralFilter(frame, 9, 75, 75)
        elif self.tier == HardwareTier.TIER_1_RTX:
            # RTX: Simulate heavy load or use actual model if available
            # Placeholder for SuperRes
            return cv2.detailEnhance(frame, sigma_s=10, sigma_r=0.15)
        return frame

    def release(self):
        self.cap.release()
        cv2.destroyAllWindows()
