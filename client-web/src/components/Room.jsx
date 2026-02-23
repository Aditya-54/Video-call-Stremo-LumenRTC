import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import Chat from './Chat';
import GpuStats from './GpuStats';

const SIGNALING_URL = `http://${window.location.hostname}:3000`;

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

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('hardware-info', (data) => {
            console.log("Received Backend Hardware Info:", data);
            setBackendStats(data.specs);
        });

        const startCall = async () => {
            try {
                console.log('Requesting media devices...');
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                console.log('Got local stream:', stream.id);
                
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                console.log('Joining room:', roomId);
                newSocket.emit('join-room', roomId);
                setStatus('Waiting for peer...');
            } catch (err) {
                console.error("Error accessing media:", err);
                if (err.name === 'NotReadableError') {
                    setStatus('Camera busy (Close other apps/tabs?)');
                } else if (err.name === 'NotAllowedError') {
                    setStatus('Camera/Mic permission denied');
                } else {
                    setStatus('Error accessing camera/mic: ' + err.message);
                }
            }
        };

        startCall();

        return () => {
            console.log('Cleaning up Room component');
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped track:', track.kind);
                });
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                console.log('Closed peer connection');
            }
            newSocket.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

        const createPeerConnection = () => {
            if (peerConnection.current) {
                console.log('Reusing existing peer connection');
                return peerConnection.current;
            }

            console.log('Creating new peer connection');
            const pc = new RTCPeerConnection(RTC_CONFIG);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate');
                    socket.emit('candidate', { roomId, candidate: event.candidate });
                } else {
                    console.log('All ICE candidates sent');
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log("ICE Connection State:", pc.iceConnectionState);
                if (pc.iceConnectionState === 'connected') {
                    setStatus('Connected');
                } else if (pc.iceConnectionState === 'failed') {
                    setStatus('Connection Failed (ICE)');
                } else if (pc.iceConnectionState === 'disconnected') {
                    setStatus('Peer Disconnected');
                }
            };

            pc.onconnectionstatechange = () => {
                console.log("Connection State:", pc.connectionState);
            };

            pc.ontrack = (event) => {
                console.log("Remote Track Received:", event.streams[0].id);
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setStatus('Connected');
            };

            if (localStreamRef.current) {
                console.log('Adding local tracks to peer connection');
                localStreamRef.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamRef.current);
                    console.log('Added track:', track.kind);
                });
            } else {
                console.error("No local stream to add to PC!");
            }

            peerConnection.current = pc;
            return pc;
        };

        const waitForLocalStream = async () => {
            let attempts = 0;
            while (!localStreamRef.current && attempts < 50) {
                console.log("Waiting for local stream... attempt", attempts + 1);
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            if (!localStreamRef.current) {
                console.error("Timed out waiting for local stream");
            }
            return localStreamRef.current;
        };

        socket.on('user-connected', async (userId) => {
            console.log("User connected:", userId);
            setStatus('Peer joined. Initiating...');

            await waitForLocalStream();

            const pc = createPeerConnection();
            console.log('Creating offer...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('Sending offer, SDP length:', pc.localDescription.sdp.length);

            socket.emit('offer', { roomId, sdp: pc.localDescription.sdp });
        });

        socket.on('offer', async (data) => {
            console.log("Received Offer - Full data object:", data);
            console.log("Type of data:", typeof data);
            console.log("Is data a string?", typeof data === 'string');
            
            // Handle both cases: data might be just the SDP string or an object
            let sdp;
            if (typeof data === 'string') {
                sdp = data;
                console.log('Data is SDP string directly, length:', sdp.length);
            } else if (data && data.sdp) {
                sdp = data.sdp;
                console.log('Data is object with sdp property, length:', sdp.length);
            } else {
                console.error('Invalid offer data format:', data);
                return;
            }
            
            setStatus('Receiving call...');

            await waitForLocalStream();

            const pc = createPeerConnection();
            console.log('Setting remote description (offer)');
            await pc.setRemoteDescription(new RTCSessionDescription({ 
                type: 'offer', 
                sdp: sdp
            }));

            console.log('Creating answer...');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('Sending answer, SDP length:', pc.localDescription.sdp.length);

            socket.emit('answer', { roomId, sdp: pc.localDescription.sdp });
            setStatus('Answering...');
        });

        socket.on('answer', async (data) => {
            console.log("Received Answer - Full data object:", data);
            console.log("Type of data:", typeof data);
            
            // Handle both cases: data might be just the SDP string or an object
            let sdp;
            if (typeof data === 'string') {
                sdp = data;
                console.log('Data is SDP string directly, length:', sdp.length);
            } else if (data && data.sdp) {
                sdp = data.sdp;
                console.log('Data is object with sdp property, length:', sdp.length);
            } else {
                console.error('Invalid answer data format:', data);
                return;
            }
            
            const pc = peerConnection.current;
            if (pc) {
                console.log('Setting remote description (answer)');
                await pc.setRemoteDescription(new RTCSessionDescription({ 
                    type: 'answer', 
                    sdp: sdp
                }));
                console.log('Remote description set successfully');
            } else {
                console.error('No peer connection when receiving answer');
            }
        });

        socket.on('candidate', async (candidate) => {
            console.log('Received ICE candidate');
            const pc = peerConnection.current;
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('Added ICE candidate');
            } else {
                console.warn('Cannot add ICE candidate, peer connection not ready');
            }
        });

        return () => {
            socket.off('user-connected');
            socket.off('offer');
            socket.off('answer');
            socket.off('candidate');
            socket.off('hardware-info');
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('Set remote stream to video element');
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            const enabled = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
            setIsMuted(!isMuted);
            console.log('Audio', enabled ? 'unmuted' : 'muted');
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const enabled = !isVideoOff;
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
            setIsVideoOff(!isVideoOff);
            console.log('Video', enabled ? 'enabled' : 'disabled');
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