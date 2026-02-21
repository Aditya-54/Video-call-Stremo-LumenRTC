import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import Chat from './Chat';
import GpuStats from './GpuStats';

const SIGNALING_URL = `http://${window.location.hostname}:3000`; // import.meta.env.VITE_SIGNALING_URL ||

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export default function Room({ username, roomId, onLeave }) {
    console.log("Room Component Mounted", { username, roomId });
    const [socket, setSocket] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [status, setStatus] = useState('Connecting...');

    const [backendStats, setBackendStats] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        const newSocket = io(SIGNALING_URL);
        setSocket(newSocket);

        newSocket.on('hardware-info', (data) => {
            console.log("Received Backend Hardware Info:", data);
            setBackendStats(data.specs);
        });


        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                newSocket.emit('join-room', roomId);
                setStatus('Waiting for peer...');
            } catch (err) {
                console.error("Error accessing media:", err);
                if (err.name === 'NotReadableError') {
                    setStatus('Camera busy (Close other apps/tabs?)');
                } else {
                    setStatus('Error accessing camera/mic: ' + err.message);
                }
            }
        };

        startCall();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            newSocket.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

        const createPeerConnection = () => {
            if (peerConnection.current) return peerConnection.current;

            const pc = new RTCPeerConnection(RTC_CONFIG);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('candidate', { roomId, candidate: event.candidate });
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log("ICE State:", pc.iceConnectionState);
                if (pc.iceConnectionState === 'connected') setStatus('Connected');
                if (pc.iceConnectionState === 'failed') setStatus('Connection Failed (ICE)');
                if (pc.iceConnectionState === 'disconnected') setStatus('Peer Disconnected');
            };

            pc.ontrack = (event) => {
                console.log("Remote Track Received", event.streams[0]);
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setStatus('Connected');
            };

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
            } else {
                console.warn("No local stream to add to PC!");
            }

            peerConnection.current = pc;
            return pc;
        };

        // Helper to wait for local stream
        const waitForLocalStream = async () => {
            let attempts = 0;
            while (!localStreamRef.current && attempts < 50) { // Wait up to 5s
                console.log("Waiting for local stream...");
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            if (!localStreamRef.current) console.error("Timed out waiting for local stream");
            return localStreamRef.current;
        };

        socket.on('user-connected', async (userId) => {
            console.log("User connected:", userId);
            setStatus('Peer joined. Initiating...');

            await waitForLocalStream(); // Ensure we have camera before calling

            const pc = createPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('offer', { roomId, sdp: pc.localDescription.sdp });
        });

        socket.on('offer', async (data) => {
            console.log("Received Offer");
            setStatus('Receiving call...');

            await waitForLocalStream(); // Ensure we have camera before answering

            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('answer', { roomId, sdp: pc.localDescription.sdp });
            setStatus('Connected');
        });

        socket.on('answer', async (data) => {
            console.log("Received Answer");
            const pc = peerConnection.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
            }
        });

        socket.on('candidate', async (candidate) => {
            const pc = peerConnection.current;
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('hardware-info', (data) => {
            if (onBackendStats) onBackendStats(data.specs);
        });

        return () => {
            socket.off('user-connected');
            socket.off('offer');
            socket.off('answer');
            socket.off('candidate');
            socket.off('hardware-info');
        };
    }, [socket, roomId]);

    // Ensure video element gets stream even after re-renders
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden relative">
            {/* Debug/Loading Overlay */}
            {status === 'Connecting...' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <h2 className="text-xl font-bold">Joining Room...</h2>
                    <p className="text-gray-400 text-sm mt-2">{status}</p>
                </div>
            )}

            {/* Main Video Area */}
            <div className="flex-1 flex flex-col relative">
                <GpuStats peerConnection={peerConnection.current} backendStats={backendStats} />

                <div className="absolute top-4 left-4 z-10 bg-black/50 px-4 py-2 rounded-lg text-white font-mono text-sm backdrop-blur-md">
                    Room: {roomId} | Status: <span className={status === 'Connected' ? 'text-green-400' : 'text-yellow-400'}>{status}</span>
                </div>

                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {/* Remote Video */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                    {(!remoteStream || status !== 'Connected') && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <div className="animate-pulse">Waiting for video...</div>
                        </div>
                    )}

                    {/* Local Video (PIP) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900">
                                <VideoOff className="w-8 h-8" />
                            </div>
                        )}
                        <div className="absolute bottom-1 left-2 text-xs font-semibold text-white/80 drop-shadow-md">You</div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-6">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
                    </button>

                    <button
                        onClick={onLeave}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
                    >
                        <PhoneOff className="text-white w-6 h-6" />
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 h-full border-l border-gray-700 bg-gray-800 hidden md:block">
                <Chat socket={socket} roomId={roomId} username={username} />
            </div>
        </div>
    );
}
