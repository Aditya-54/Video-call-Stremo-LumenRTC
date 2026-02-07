import asyncio
import cv2
from hardware_probe import HardwareProvider
from signaling_client import SignalingClient
from rtc_manager import RTCManager
from media_pipeline import MediaPipelineTrack

async def main():
    import sys
    role = "joiner" # default
    if len(sys.argv) > 1:
        role = sys.argv[1].lower() # "host" or "joiner"
        
    print(f"Starting LumenRTC (Python) as {role.upper()}...")
    
    # 1. Hardware Probe
    specs = HardwareProvider.get_capabilities()
    print(f"Hardware Detected: {specs['tier']}")
    if specs['has_cuda']:
        print(f"GPU: {specs['gpu_name']}")

    # 2. Setup Components
    signaling = SignalingClient("http://localhost:3000", None, None, None)
    rtc = RTCManager(signaling)
    
    # 3. Media Pipeline
    video_track = MediaPipelineTrack(specs)
    rtc.set_local_video_track(video_track)
    
    # 4. Wire up Callbacks
    signaling.on_offer_callback = rtc.handle_offer
    signaling.on_answer_callback = rtc.handle_answer
    signaling.on_candidate_callback = rtc.handle_candidate
    
    async def on_user_connected_handler(user_id):
        print(f"Peer connected ({user_id}). Sending Hardware Info...")
        await signaling.send_hardware_info(specs)

        if role == "host":
            print(f"Initiating call with {user_id}...")
            # Give a slight delay for peer to be ready
            await asyncio.sleep(1)
            await rtc.create_offer()
            
    signaling.set_on_user_connected(on_user_connected_handler)

    # 5. Connect
    await signaling.connect()
    
    # Send Hardware Info to Frontend
    await signaling.send_hardware_info(specs)
    
    # Auto-open the frontend in browser (for user convenience)
    import webbrowser
    webbrowser.open("http://localhost:5173") # TODO: Change to production URL later
    
    print("Running... Press Ctrl+C to exit.")
    if role == "host":
        print("Waiting for peer to join...")
    else:
        print("Joined room. Waiting for offer from Host...")
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        await signaling.close()
        await rtc.close()
        video_track.release()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
