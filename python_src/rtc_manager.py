import asyncio
import json
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, VideoStreamTrack
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

class RTCManager:
    def __init__(self, signaling_client):
        self.pc = RTCPeerConnection()
        self.signaling = signaling_client
        self.local_video_track = None
        
        self.pc.on("track", self.on_track)
        self.pc.on("iceconnectionstatechange", self.on_ice_connection_state_change)

    def set_local_video_track(self, track):
        self.local_video_track = track
        self.pc.addTrack(track)

    async def on_track(self, track):
        print(f"Track received: {track.kind}")
        if track.kind == "video":
            # Just consume it for now or display
            # In a real app we'd attach this to a remote video sink
            pass

    async def on_ice_connection_state_change(self):
        print(f"ICE Connection State: {self.pc.iceConnectionState}")

    async def create_offer(self):
        offer = await self.pc.createOffer()
        await self.pc.setLocalDescription(offer)
        await self.signaling.send_offer(self.pc.localDescription.sdp)

    async def handle_offer(self, sdp):
        if self.pc.signalingState != "stable":
            print(f"Warning: Received Offer in {self.pc.signalingState} state. Ignoring to avoid collision.")
            return
        
        print("Processing Remote Offer...")
        await self.pc.setRemoteDescription(RTCSessionDescription(sdp, 'offer'))
        answer = await self.pc.createAnswer()
        await self.pc.setLocalDescription(answer)
        await self.signaling.send_answer(self.pc.localDescription.sdp)

    async def handle_answer(self, sdp):
        if self.pc.signalingState == "stable":
            print("Warning: Received Answer in stable state. Ignoring.")
            return
            
        print("Processing Remote Answer...")
        await self.pc.setRemoteDescription(RTCSessionDescription(sdp, 'answer'))

    async def handle_candidate(self, candidate_info):
        # aiortc handles candidates a bit differently, usually bundled in SDP or trickle.
        # For simplicity, if we get a candidate object:
        # candidate = RTCIceCandidate(...)
        # await self.pc.addIceCandidate(candidate)
        print("Received ICE Candidate (Not implemented for aiortc trickle yet)")

    async def close(self):
        await self.pc.close()
