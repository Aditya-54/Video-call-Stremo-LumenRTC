const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("TEST: Connected to server with ID:", socket.id);
    socket.emit("join-room", "test-room");
});

socket.on("user-connected", (userId) => {
    console.log("TEST: User connected:", userId);
    // Determine success if we get here or just by connecting
});

socket.on("disconnect", () => {
    console.log("TEST: Disconnected");
});

// Keep alive for a bit then exit
setTimeout(() => {
    console.log("TEST: Finishing test...");
    socket.disconnect();
    process.exit(0);
}, 2000);
