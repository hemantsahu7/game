

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useState } from "react";
import { Environment } from "@react-three/drei";
import Map from "./components/Map";
import CharacterControls from "./components/CharacterControls";
import Bullet from "./components/Bullet";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
//import { Bloom, EffectComposer } from "@react-three/postprocessing";

const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.1,
  z: 0.8,
};

const socket = io("gameserver-production-57dd.up.railway.app", {
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  forceNew: true,
});

function App() {
  const [players, setPlayers] = useState({});
  const [bullets, setBullets] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const [hit,sethit] = useState(false);
  const[death,setdeath] = useState(false);
  const [firstlogin,setlogin] = useState(false);
  const [name,setname] = useState('');
  const [submit,setsubmit] = useState(false);
  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
      setlogin(true);
      console.log("Connected as:", socket.id);
    });

    socket.on("currentPlayers", ({ id, currPlayers }) => {
      setPlayers(currPlayers);
      setPlayerId(id);
    });

    socket.on("newPlayer", ({ id, state }) => {
      setPlayers((prev) => ({ ...prev, [id]: state }));
    });

    socket.on("playerUpdated", ({ id, state }) => {
      setPlayers((prev) => ({ ...prev, [id]: state }));
    });

    socket.on("bulletFired", (newBullet) => {
      setBullets((prev) => [...prev, newBullet]);
    });

    socket.on("updateBullets", (updatedBullets) => {
      setBullets(updatedBullets);
    });

    socket.on("playerDisconnected", (id) => {
      setPlayers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    });
    socket.on("animateHit",({id})=>{
      
      if(String(socket.id) === String(id)){
        console.log(id);
        decreasehealth(id);
        oncollision();
        endcollision();
      }

    });

    return () => {
      socket.off("connect");
      socket.off("currentPlayers");
      socket.off("newPlayer");
      socket.off("playerUpdated");
      socket.off("bulletFired");
      socket.off("updateBullets");
      socket.off("playerDisconnected");
      socket.off("animateHit");
    };
  }, []);

  function oncollision(id){
    sethit(true);
    
  }

  function endcollision(){
    setTimeout(() => {
      sethit(false);
    }, 1000);
  }
  function setloginfalse(){
    setlogin(false);
  }
  
  function decreasehealth(id) {
    setPlayers((prevPlayers) => {
      const updatedPlayers = { ...prevPlayers }; // Create a copy of the current players state
      if (updatedPlayers[id]?.health>=10) {
        updatedPlayers[id] = {
          ...updatedPlayers[id],
          health: updatedPlayers[id].health - 2, // Decrease health by 2
        };
      }
      if(updatedPlayers[id].health === 0){
        setdeath(true);
      }
      return updatedPlayers; // Return the updated state
    });
  
    // Notify the server about the updated health for synchronization
    //socket.emit("updatePlayerHealth", { id, health: players[id]?.health - 10 });
  }

  const fireBullet = (position, angle) => {
    const bulletPosition = {
      x: position.x + Math.sin(angle) * WEAPON_OFFSET.z + Math.cos(angle) * WEAPON_OFFSET.x, 
      y: position.y+WEAPON_OFFSET.y,
      z: position.z + Math.cos(angle) * WEAPON_OFFSET.z - Math.sin(angle) * WEAPON_OFFSET.x,
    };
  
    const newBullet = {
      id: uuidv4(), // Generate a unique ID
      playerId,
      position: bulletPosition,
      starting: Date.now(),
      angle,
      hasHit:false,
      timestamp: Date.now(),
    };
  
    setBullets((prev) => [...prev, newBullet]);
    socket.emit("fireBullet", newBullet);
  };
function triggerKey(key, isDown) {
  const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', { key });
  window.dispatchEvent(event);
}

function events(key) {
  return {
    onTouchStart: () => triggerKey(key, true),
    onTouchEnd: () => triggerKey(key, false),
    onMouseDown: () => triggerKey(key, true),
    onMouseUp: () => triggerKey(key, false),
  };
}
  

  return (
    <>
    {submit === false?
    <div className="login">
      <div className="form">
        <h3>BangRush</h3>
      <input value={name} onChange={(e)=>{setname(e.target.value)}} placeholder="Enter Username" />
      <button onClick={()=>{setsubmit(true)}}>submit</button>
      </div>
    </div>:
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 10, 30], fov: 30, near: 2 }} dpr={[1, 1.5]}>

        <ambientLight intensity={0.5} />
        <directionalLight position={[25, 18, -25]} intensity={0.3} />
        <Suspense>
          <Physics gravity={[0, -9.82*2, 0]}>
            
            <Map />
            {Object.entries(players).map(([id, state]) => (
              <CharacterControls
                key={id}
                soldierid={id}
                socket={socket}
                playerId={playerId}
                isUserPlayer={id === playerId}
                playername= {name}
                initialState={state}
                fireBullet={fireBullet}
                hit = {hit}
                death = {death}
                login={firstlogin}
                setloginfalse={setloginfalse}
               
              />
            ))}
            
            
            {bullets.map((bullet) => (
                <Bullet
                 key={bullet.id}
                 socket={socket}
                 playerId={playerId}
                 bullet={bullet}
                 
               />
             ))}
            
          </Physics>
          <Environment preset="dawn" background backgroundBlurriness={0}/>
        </Suspense>
        
      </Canvas>
        <div className="mobile-controls">
         <div className="movement-left">
           <div className="row">
             <button className="control-btn" {...events('w')}>W</button>
           </div>
          <div className="row">
             <button className="control-btn" {...events('a')}>A</button>
             <button className="control-btn" {...events('z')}>Z</button>
             <button className="control-btn" {...events('d')}>D</button>
          </div>
          <div className="row">
             <button className="control-btn" {...events('s')}>S</button>
          </div>
         </div>

         <div className="movement-right">
            <button className="control-btn" {...events('j')}>J</button>
            <button className="control-btn" {...events('f')}>F</button>
         </div>
        </div>

    </div>
   }
   </>
  );
}


export default App;
