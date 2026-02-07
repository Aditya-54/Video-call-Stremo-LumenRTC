import asyncio
import sys
import aioconsole
from hardware_probe import HardwareProvider
from signaling_client import SignalingClient
from rtc_manager import RTCManager
from media_pipeline import MediaPipelineTrack
from aiortc.contrib.media import MediaPlayer

# ANSI Colors
RESET = "\033[0m"
GREEN = "\033[32m"
BLUE = "\033[34m"
YELLOW = "\033[33m"
RED = "\033[31m"

class TerminalApp:
    def __init__(self):
        self.username = ""
        self.room_id = ""
        self.signaling = None
        self.rtc = None
        self.video_track = None
        self.audio_player = None
        self.in_call = False
        self.loop = asyncio.get_event_loop()

    async def start(self):
        print(f"{GREEN}=== LumenRTC Terminal Chat ==={RESET}")
        self.username = await aioconsole.ainput("Enter Username: ")
        self.room_id = await aioconsole.ainput("Enter Room ID to Join/Create: ")
        
        # 1. Hardware Probe
        self.specs = HardwareProvider.get_capabilities()
        print(f"{YELLOW}System detected: {self.specs['tier']}{RESET}")
        if self.specs['has_cuda']:
            print(f"{YELLOW}GPU: {self.specs['gpu_name']}{RESET}")

        # 2. Setup Signaling
        self.signaling = SignalingClient("http://localhost:3000", self.on_offer, self.on_answer, self.on_candidate)
        
        # 3. Setup RTC
        self.rtc = RTCManager(self.signaling)
        
        # Custom Signaling Events
        @self.signaling.sio.on('chat-message')
        async def on_chat(data):
            if data['sender'] != self.username:
                print(f"\r{BLUE}[{data['sender']}]: {data['message']}{RESET}")
                print(f"{GREEN}[You]: {RESET}", end="", flush=True)

        @self.signaling.sio.on('user-connected')
        async def on_user_info(user_id):
            print(f"\r{YELLOW}User {user_id} joined the room.{RESET}")
            print(f"{GREEN}[You]: {RESET}", end="", flush=True)

        # Connect
        await self.signaling.connect()
        await self.signaling.sio.emit('join-room', self.room_id)
        print(f"{GREEN}Joined Room: {self.room_id}{RESET}")
        print(f"Type message to chat. Type {RED}/call{RESET} to video call. Type {RED}/quit{RESET} to exit.")

        # Start Input Loop
        await self.input_loop()

    async def input_loop(self):
        while True:
            msg = await aioconsole.ainput(f"{GREEN}[You]: {RESET}")
            
            if msg.startswith("/"):
                await self.handle_command(msg)
            else:
                if msg.strip():
                    await self.signaling.sio.emit('chat-message', {
                        'roomId': self.room_id,
                        'sender': self.username,
                        'message': msg
                    })

    async def handle_command(self, cmd):
        if cmd == "/quit":
            print("Exiting...")
            await self.cleanup()
            sys.exit(0)
        elif cmd == "/call":
            if not self.in_call:
                print(f"{YELLOW}Starting Video Call...{RESET}")
                await self.start_av_pipeline()
                await self.rtc.create_offer()
                self.in_call = True
            else:
                print(f"{RED}Already in a call.{RESET}")
        elif cmd == "/hangup":
             if self.in_call:
                 print(f"{YELLOW}Ending Call...{RESET}")
                 await self.stop_av_pipeline()
                 # Send a hangup signal (not implemented in signaling but good practice)
                 self.in_call = False
             else:
                 print(f"{RED}Not in a call.{RESET}")

    async def start_av_pipeline(self):
        # Video
        self.video_track = MediaPipelineTrack(self.specs)
        self.rtc.set_local_video_track(self.video_track)
        
        # Audio (Try to capture mic)
        try:
             # On Windows/DirectShow, finding device is tricky. 
             # 'audio=default' might work if FFMPEG dshow is available.
             # fallback to no audio if fails.
             print("Initializing Audio...")
             self.audio_player = MediaPlayer('audio=microphone', format='dshow')
             if self.audio_player.audio:
                 self.rtc.pc.addTrack(self.audio_player.audio)
                 print(f"{GREEN}Microphone Active.{RESET}")
        except Exception as e:
            print(f"{RED}Audio init failed (Check FFMPEG/PyAudio): {e}{RESET}")
            print("Proceeding with Video Only.")

    async def stop_av_pipeline(self):
        if self.video_track:
            self.video_track.release()
            self.video_track = None
        if self.audio_player:
            self.audio_player.stop()
            self.audio_player = None
        # Re-init RTC for next call
        await self.rtc.close()
        self.rtc = RTCManager(self.signaling) # Fresh PC

    # RTC Callbacks
    async def on_offer(self, data):
        print(f"\r{YELLOW}Incoming Video Call... Auto-Accepting.{RESET}")
        print(f"{GREEN}[You]: {RESET}", end="", flush=True)
        
        self.in_call = True
        await self.start_av_pipeline()
        await self.rtc.handle_offer(data)

    async def on_answer(self, data):
        print(f"\r{YELLOW}Call Accepted.{RESET}")
        print(f"{GREEN}[You]: {RESET}", end="", flush=True)
        await self.rtc.handle_answer(data)

    async def on_candidate(self, data):
        await self.rtc.handle_candidate(data)

    async def cleanup(self):
        await self.signaling.close()
        await self.stop_av_pipeline()

if __name__ == "__main__":
    app = TerminalApp()
    try:
        asyncio.run(app.start())
    except KeyboardInterrupt:
        pass
