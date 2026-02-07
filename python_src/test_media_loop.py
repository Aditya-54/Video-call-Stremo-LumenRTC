import asyncio
import cv2
from media_pipeline import MediaPipelineTrack
from hardware_probe import HardwareProvider

async def main():
    print("Testing Media Pipeline Loop (No WebRTC)...")
    specs = HardwareProvider.get_capabilities()
    track = MediaPipelineTrack(specs)
    
    print("Press 'q' or 'ESC' to exit.")
    
    try:
        while True:
            # Manually pump the track
            frame = await track.recv()
            
            # The track already does imshow in recv() for this prototype
            # But let's check for exit key here too just in case
            if cv2.waitKey(1) & 0xFF == 27:
                break
            
            # Yield control to event loop to simulate async behavior
            await asyncio.sleep(0.001)
            
    except KeyboardInterrupt:
        pass
    finally:
        track.release()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
