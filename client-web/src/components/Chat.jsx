import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function Chat({ socket, roomId, username }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (data) => {
            setMessages((prev) => [...prev, { ...data, isSelf: false }]);
        };

        socket.on('chat-message', handleMessage);

        return () => {
            socket.off('chat-message', handleMessage);
        };
    }, [socket]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socket) {
            const msgData = { roomId, sender: username, message: input };
            socket.emit('chat-message', msgData);
            setMessages((prev) => [...prev, { ...msgData, isSelf: true }]);
            setInput('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="bg-gray-900 p-4 border-b border-gray-700 flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-200">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                        <div className={`px-4 py-2 rounded-lg max-w-[80%] break-words ${msg.isSelf
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-700 text-gray-200 rounded-tl-none'
                            }`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                    <Send className="w-5 h-5 text-white" />
                </button>
            </form>
        </div>
    );
}
