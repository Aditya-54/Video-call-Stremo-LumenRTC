import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Zap, Globe, Shield, Satellite, Radio, Cpu, Lock, Video, ChevronRight, Server, Download } from 'lucide-react';
import Lobby from './Lobby';

export default function Hero({ onJoin }) {
    const scrollToLobby = () => {
        document.getElementById('lobby-section').scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAbout = () => {
        document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative w-full overflow-x-hidden bg-gray-950 text-white selection:bg-cyan-500/30">
            {/* Global Background */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-gray-950 to-black opacity-80" />
            <BackgroundElements />

            {/* --- HERO SECTION --- */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 pt-10">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-6 animate-pulse">
                        <Satellite className="w-4 h-4" />
                        <span>Next-Gen WebRTC Protocol</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-5xl mx-auto"
                >
                    <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-2xl">
                        Video Chats, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                            Supercharged.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        Leverages your <span className="text-white font-semibold">local GPU</span> to upscale video quality in real-time.
                        Enhanced clarity, minimal latency, and absolute privacy.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button
                            onClick={scrollToLobby}
                            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center gap-2 text-lg"
                        >
                            Get Started
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={scrollToAbout}
                            className="px-8 py-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-full hover:bg-gray-800 transition-all text-white font-semibold text-lg"
                        >
                            How it Works
                        </button>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <a
                            href="https://github.com/Aditya-54/Video-call-Stremo-LumenRTC"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-sm font-medium text-gray-300 transition-all border border-gray-700 flex items-center gap-2 hover:text-white hover:border-blue-500/50"
                        >
                            <Download className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            Download AI Engine (.exe) on GitHub
                        </a>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 max-w-lg mx-auto">
                        * To enable <strong>AI Upscaling</strong> and <strong>GPU Acceleration</strong>, you must download and run the AI Engine on your PC.
                        The web version supports standard video calling only.
                    </p>
                </motion.div>

                {/* Scroll Hint */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    onClick={scrollToAbout}
                >
                    <ArrowDown className="w-8 h-8 text-white" />
                </motion.div>
            </div>

            {/* --- DETAILED ABOUT SECTION --- */}
            <div id="about-section" className="relative z-10 py-32 bg-black/40 backdrop-blur-sm border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Built Different.</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Most video apps compress your video to save their server costs.
                            We do the opposite: we use the raw power of your device to enhance the stream.
                        </p>
                    </div>

                    {/* Feature 1: AI Upscaling */}
                    <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/50">
                                <Cpu className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Hardware-Accelerated AI</h3>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                LumenRTC detects your dedicated GPU (NVIDIA RTX, AMD Radeon) or Neural Engine (Apple Silicon).
                                It uses a lightweight shader pipeline to apply <strong>Super Resolution</strong> to incoming video streams.
                            </p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span>Transform standard streams into High Definition.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span>Reduces bandwidth usage by 60%.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 blur-3xl opacity-20" />
                            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                                    <span className="text-xs font-mono text-gray-500">PIPELINE_DEBUG</span>
                                    <span className="text-xs font-mono text-green-400">STATUS: ACTIVE</span>
                                </div>
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Input Resolution</span>
                                        <span className="text-red-400">1280x720 (HD)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Upscaling Factor</span>
                                        <span className="text-blue-400">x2.0 (Bicubic+Sharpen)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Output Resolution</span>
                                        <span className="text-green-400">High Fidelity</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
                                        <div className="h-full w-[85%] bg-cyan-500 animate-pulse" />
                                    </div>
                                    <div className="text-right text-xs text-cyan-500">GPU Load: 12%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: P2P Privacy */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/50">
                                <Lock className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">True Peer-to-Peer Privacy</h3>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                We don't have servers that watch you. LumenRTC connects you <strong>directly</strong> to the other person.
                                Your video data flows from your device to theirs, encrypted and untouched.
                            </p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span>End-to-End Encryption (DTLS-SRTP).</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Server className="w-5 h-5 text-red-400" />
                                    <span>No middleman recording servers.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square max-w-md mx-auto relative">
                                {/* Abstract Network Visual */}
                                <div className="absolute inset-0 border-2 border-dashed border-gray-700 rounded-full animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-10 border border-gray-600 rounded-full" />

                                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400 mb-1">YOU</div>
                                        <Video className="w-6 h-6 text-blue-400 mx-auto" />
                                    </div>
                                </div>

                                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-purple-500 p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400 mb-1">PEER</div>
                                        <Video className="w-6 h-6 text-purple-400 mx-auto" />
                                    </div>
                                </div>

                                {/* Connection Beam */}
                                <div className="absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-blue-500 via-white to-purple-500 transform -translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- LOBBY SECTION (Action) --- */}
            <div id="lobby-section" className="relative z-10 min-h-screen flex flex-col items-center justify-center py-20 bg-black/20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Ready to start?</h2>
                    <p className="text-gray-400">Join a room instantly or create a new one.</p>
                </div>
                <Lobby onJoin={onJoin} isEmbedded={true} />

                <footer className="mt-20 text-gray-600 text-sm">
                    © 2026 LumenRTC Project.
                </footer>
            </div>

        </div>
    );
}

function BackgroundElements() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
            {/* Satellite 1 */}
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 right-10 opacity-10"
            >
                <Satellite className="w-48 h-48 text-blue-400" />
            </motion.div>

            {/* Network Nodes */}
            <motion.div
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-20 left-20 text-purple-900"
            >
                <Radio className="w-96 h-96 opacity-20" />
            </motion.div>
        </div>
    )
}
