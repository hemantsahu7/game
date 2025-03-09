/*import { io } from "socket.io-client";
import { useState, useEffect } from "react";

const socket = io("http://localhost:3000", {
  withCredentials: true,
  reconnectionAttempts: 5,  // Retry up to 5 times
  reconnectionDelay: 1000,  // Wait 1 second between attempts
  forceNew: true,
});

function Contextapi() {
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    // Retry mechanism to ensure playerId is set
    const checkSocketId = (retryCount = 5) => {
      if (socket.id) {
        setPlayerId(socket.id);
        console.log("Connected to server:", socket.id);
        //socket.emit("clientReady");
      } else if (retryCount > 0) {
        console.log(`Retrying to get socket ID... Attempts left: ${retryCount}`);
        setTimeout(() => checkSocketId(retryCount - 1), 1000);
      } else {
        console.warn("Failed to obtain socket ID after multiple attempts.");
      }
    };

    // Listen for connection and trigger socket ID check
    socket.on("connect", () => {
      console.log("Socket connected, checking ID...");
      checkSocketId();
    });

    // Event listeners for handling player states
    socket.on("currentPlayers", ({id,currPlayers}) => {
      console.log("Received current players:", currPlayers);
      setPlayers(currPlayers);
      setPlayerId(id);
    });

    socket.on("newPlayer", ({ id, state }) => {
      console.log("New player connected:", id, state);
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [id]: state,
      }));
    });

    socket.on("playerUpdated", ({ id, state }) => {
      console.log("Player updated:", id, state);
      setPlayers((prev) => ({ ...prev, [id]: state }));
    });

    socket.on("playerDisconnected", (id) => {
      console.log("Player disconnected:", id);
      setPlayers((prev) => {
        const updatedPlayers = { ...prev };
        delete updatedPlayers[id];
        return updatedPlayers;
      });
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("currentPlayers");
      socket.off("newPlayer");
      socket.off("playerUpdated");
      socket.off("playerDisconnected");
    };
  }, []);

  return (
    <div>
      <h3>Player ID: {playerId || "Waiting for connection..."}</h3>
      <pre>{JSON.stringify(players, null, 2)}</pre>
    </div>
  );
}

export default Contextapi;*/
