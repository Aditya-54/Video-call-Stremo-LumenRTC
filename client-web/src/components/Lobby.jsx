import React, { useState } from 'react';
import { Video, Users, ArrowRight, Plus, Hash } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Lobby({ onJoin, isEmbedded = false }) {
    const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        if (username && roomId) {
            onJoin(username, roomId);
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (username) {
            // Generate a random 4-char code for easy sharing
            const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
            onJoin(username, newRoomId);
        }
    };

    return (
        <div className={clsx(
            "flex flex-col items-center justify-center p-4 transition-all w-full",
            !isEmbedded && "min-h-screen bg-gray-900 text-white"
        )}>
            <div className={twMerge(
                "bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 overflow-hidden",
                !isEmbedded && "shadow-2xl",
                isEmbedded && "bg-gray-900/80 backdrop-blur-xl border-gray-600 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            )}>
                {/* Header / Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-800/50">
                    <button
                        onClick={() => setActiveTab('join')}
                        className={clsx(
                            "flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                            activeTab === 'join' ? "bg-gray-700/50 text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                        )}
                    >
                        <Hash className="w-4 h-4" />
                        Join Room
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={clsx(
                            "flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                            activeTab === 'create' ? "bg-gray-700/50 text-white border-b-2 border-green-500" : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        Create Room
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-center mb-8">
                        <div className={clsx(
                            "p-3 rounded-full mr-3 shadow-lg transition-colors",
                            activeTab === 'join' ? "bg-blue-600 shadow-blue-500/20" : "bg-green-600 shadow-green-500/20"
                        )}>
                            <Video className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            {activeTab === 'join' ? 'Join Call' : 'New Call'}
                        </h1>
                    </div>

                    {activeTab === 'join' ? (
                        /* JOIN FORM */
                        <form onSubmit={handleJoinSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Display Name</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Room Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        placeholder="e.g. 1234"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-transform transform hover:scale-[1.02] shadow-lg text-white"
                            >
                                Join Now
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </form>
                    ) : (
                        /* CREATE FORM */
                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Your Name</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                                <p className="text-gray-400 text-sm mb-1">A secure room code will be generated for you.</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition-transform transform hover:scale-[1.02] shadow-lg text-white"
                            >
                                Start Meeting
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
