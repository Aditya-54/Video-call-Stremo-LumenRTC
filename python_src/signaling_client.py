import socketio
import asyncio

class SignalingClient:
    def __init__(self, url, on_offer, on_answer, on_candidate):
        self.sio = socketio.AsyncClient()
        self.url = url
        self.on_offer_callback = on_offer
        self.on_answer_callback = on_answer
        self.on_candidate_callback = on_candidate
        self.connected = False

    async def connect(self):
        @self.sio.event
        async def connect():
            print("Signaling: Connected")
            self.connected = True
            await self.sio.emit('join-room', 'test-room')

        @self.sio.event
        async def disconnect():
            print("Signaling: Disconnected")
            self.connected = False

        @self.sio.on('user-connected')
        async def on_user_connected(user_id):
            print(f"User Connected: {user_id}")
            # If we are the host/initiator, we should start the call now
            # But simpler: The new joiner sends the offer? Or existing user?
            # Standard: Existing user (Host) sends offer to new user.
            # We need a callback here.
            if self.on_offer_callback and hasattr(self, 'on_user_connected_callback'):
                 await self.on_user_connected_callback(user_id)

        @self.sio.on('offer')
        async def on_offer(data):
            if self.on_offer_callback:
                print("Received Offer")
                await self.on_offer_callback(data)

        @self.sio.on('answer')
        async def on_answer(data):
            if self.on_answer_callback:
                print("Received Answer")
                await self.on_answer_callback(data)

        @self.sio.on('candidate')
        async def on_candidate(data):
            if self.on_candidate_callback:
                await self.on_candidate_callback(data)

        try:
            await self.sio.connect(self.url)
        except Exception as e:
            print(f"Signaling Connection Error: {e}")

    async def send_offer(self, sdp):
        if self.connected:
            print("Sending Offer...")
            await self.sio.emit('offer', {'roomId': 'test-room', 'sdp': sdp})

    async def send_answer(self, sdp):
        if self.connected:
            print("Sending Answer...")
            await self.sio.emit('answer', {'roomId': 'test-room', 'sdp': sdp})
    
    # Callback setter
    def set_on_user_connected(self, callback):
        self.on_user_connected_callback = callback


    async def send_candidate(self, candidate, sdp_mid, sdp_mline_index):
        if self.connected:
            await self.sio.emit('candidate', {
                'roomId': 'test-room', 
                'candidate': {
                    'candidate': candidate, 
                    'sdpMid': sdp_mid, 
                    'sdpMLineIndex': sdp_mline_index
                }
            })

    async def send_hardware_info(self, specs):
        if self.connected:
            print(f"Sending Hardware Info: {specs}")
            await self.sio.emit('hardware-info', {
                'roomId': 'test-room', # Hardcoded for prototype
                'specs': specs
            })

    async def close(self):
        await self.sio.disconnect()
