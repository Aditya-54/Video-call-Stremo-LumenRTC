import React, { useState } from 'react';
import Hero from './components/Hero';
import Room from './components/Room';

function App() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (name, room) => {
    setUsername(name);
    setRoomId(room);
    setIsInRoom(true);
  };

  const handleLeave = () => {
    setIsInRoom(false);
    setRoomId('');
  };

  return (
    <div className="App">
      {!isInRoom ? (
        <Hero onJoin={handleJoin} />
      ) : (
        <Room username={username} roomId={roomId} onLeave={handleLeave} />
      )}
    </div>
  );
}

export default App;
