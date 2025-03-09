

/*import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { useFrame,useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CharacterSoldier } from "./CharacterSoldier";


const FIRE_RATE = 380;
const MOVEMENT_SPEED = 100;
let lastUpdateTime = 0;
const JUMP_FORCE = 60;
const updateRateLimit = 1000 / 15;
const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.4,
  z: 0.8,
};




function CharacterControls({ socket,soldierid, playerId, isUserPlayer, initialState,fireBullet,hit,death,login,setloginfalse,playername }) {
  const rigidbody = useRef();
  const character = useRef();
  const controls = useRef();
  const [animation, setAnimation] = useState(initialState.animation || "Idle");
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false ,f:false ,j:false});
  const [currentAngle, setCurrentAngle] = useState(initialState.rotation?.y || Math.PI);
  const [isJumping, setIsJumping] = useState(false);
  const [health,sethealth] = useState(initialState.health || 100);
  const lastShoot = useRef(0);
  const [zoom , setzoom] = useState(false);
  

 useEffect(() => {
    if (isUserPlayer) {
      // Handle user input for movement
      const handleKeyDown = (e) => {
        if(e.key.toLowerCase() === 'z'){
          setzoom((prev)=>(!prev));
        }
        
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
          setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
        }
      };
      const handleKeyUp = (e) => {
        
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
          setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    } else {
      // Update remote players' state
      rigidbody.current.setTranslation(initialState.position, true);
      character.current.rotation.y = initialState.rotation?.y || 0;
      setAnimation(initialState.animation || "Idle");
      sethealth(initialState.health);
    }
  }, [keys, initialState, isUserPlayer]);


  useEffect(()=>{
    if(login&& isUserPlayer){
      const intialposition = new Vector3(
         0,
        20,
        0
      );

      rigidbody.current.setTranslation(intialposition, true);
      setloginfalse();

    }

  },[login])


  useFrame((_, delta) => {
    if (!rigidbody.current) return;

    if (isUserPlayer && !hit && !death) {
      
      const keypressed = keys.w || keys.a || keys.s || keys.d;
      let angle = currentAngle;
      
      if (keypressed) {
        const angle = getAngle(keys);
        setCurrentAngle(angle);
        setAnimation("Run");
        character.current.rotation.y = angle ;
        const impulse = {
          x: Math.sin(angle) * MOVEMENT_SPEED * delta,
          y: 0,
          z: Math.cos(angle) * MOVEMENT_SPEED * delta,
        };
        rigidbody.current.applyImpulse(impulse, true);
      } 
     else  {
        setAnimation("Idle");
      }
      

    
      if (keys.f && (Date.now() - lastShoot.current > FIRE_RATE)) {
        lastShoot.current = Date.now();
        const position = rigidbody.current.translation();
        const bulletPosition = {
          x: position.x,
          y: position.y,
          z: position.z,
        };
        fireBullet(bulletPosition, angle);
      }

      if(keypressed && keys.f ){
        setAnimation("Run_Shoot");
      }
      if(!keypressed && keys.f){
        setAnimation("Idle_Shoot");
      }
      if (keys.j && !isJumping) {
        rigidbody.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
        setIsJumping(true);
        console.log("jump bro please");
        setAnimation("Jump");
      }


      if (controls.current && rigidbody.current) {
        let cameraDistanceY = zoom ? 5 : 20;
        let cameraDistanceZ = zoom ? 4 : 20;
  
        // Safely get the rigidbody's world position
        const playerWorldPos = new Vector3(
          rigidbody.current.translation().x,
          rigidbody.current.translation().y,
          rigidbody.current.translation().z
        );
  
        controls.current.setLookAt(
          playerWorldPos.x,
          playerWorldPos.y + cameraDistanceY,
          playerWorldPos.z + cameraDistanceZ,
          playerWorldPos.x + Math.sin(angle),
          playerWorldPos.y + 1,
          playerWorldPos.z + Math.cos(angle),
          true
        );
      }

       


      // Update server state
      const currentTime = performance.now();
      if (currentTime - lastUpdateTime >= updateRateLimit) {
        lastUpdateTime = currentTime;
        socket.emit("updatePlayer", {
          name:playername,
          position: rigidbody.current.translation(),
          rotation: { y: character.current.rotation.y },
          animation,
          health
        });
      }
    }

    if(isUserPlayer && hit){
      if(death){
        rigidbody
        setAnimation("Death");
      sethealth(initialState.health);
      const currentTime = performance.now();
      if (currentTime - lastUpdateTime >= updateRateLimit) {
        lastUpdateTime = currentTime;
        socket.emit("updatePlayer", {
          name:playername,
          position: rigidbody.current.translation(),
          rotation: { y: character.current.rotation.y },
          animation,
          health
        });

      }
      rigidbody.current.setEnabled(false);
      }
      else{
        setAnimation("HitReact");
        sethealth(initialState.health);
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateRateLimit) {
          lastUpdateTime = currentTime;
          socket.emit("updatePlayer", {
            name:playername,
            position: rigidbody.current.translation(),
            rotation: { y: character.current.rotation.y },
            animation,
            health
          });
        }
      }
      
    }

    if (isJumping) {
      const velocity = rigidbody.current.linvel();
      if (Math.abs(velocity.y) < 0.01) {
        setIsJumping(false);
      }
    }


  });


  
  


 
  

  
  


  

  
  

  function getAngle(keys) {
    let angle = 0;
    if (keys.w) angle = keys.a ? Math.PI / 4 : keys.d ? -Math.PI / 4 : 0;
    else if (keys.s) angle = keys.a ? 3 * Math.PI / 4 : keys.d ? -3 * Math.PI / 4 : Math.PI;
    else angle = keys.a ? Math.PI / 2 : keys.d ? -Math.PI / 2 : 0;
    return angle + Math.PI;
  }

  return (
    <>
   { isUserPlayer && <CameraControls ref={controls} />}
    <RigidBody 
    ref={rigidbody} 
    lockRotations 
    colliders={false} 
    linearDamping={5} 
    type="dynamic"
    userData={{ type: "player", playerId }}
    
    >
      <PlayerInfo soldiername={isUserPlayer?playername:initialState.name} health={health}/>
      <group ref={character}>
        <CharacterSoldier animation={animation} />
        {isUserPlayer && (
            <Crosshair
              position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
            />
          )}
      </group>
      <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
    </RigidBody>
    </>
  );
}

export default CharacterControls;


const PlayerInfo = ({soldiername,health}) => {
  const name = soldiername;
  return (
    <Billboard position-y={2.5}>
      <mesh position-z={-0.1}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-1 * (1 - health / 100)}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Text position-y={0.36} fontSize={0.2}>
        {name}
        <meshBasicMaterial color="green" />
      </Text>
    </Billboard>
  );
};


const Crosshair = (props) => {
  return (
    <group {...props}>
      <mesh position-z={1}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.9} />
      </mesh>
      <mesh position-z={2}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.85} />
      </mesh>
      <mesh position-z={3}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>

      <mesh position-z={4.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.7} transparent />
      </mesh>

      <mesh position-z={6.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.6} transparent />
      </mesh>

      <mesh position-z={9}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
*/

/*

import { RigidBody, CapsuleCollider } from "@react-three/rapier"; 
import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CharacterSoldier } from "./CharacterSoldier";

const FIRE_RATE = 380;
const MOVEMENT_SPEED = 100;
let lastUpdateTime = 0;
const JUMP_FORCE = 60;
const updateRateLimit = 1000 / 15;
const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.4,
  z: 0.8,
};

function CharacterControls({
  socket,
  soldierid,
  playerId,
  isUserPlayer,
  initialState,
  fireBullet,
  hit,
  death,
  login,
  setloginfalse,
  playername,
}) {
  const rigidbody = useRef();
  const character = useRef();
  const controls = useRef();
  // Get the camera from the fiber state.
  const { camera } = useThree();
  
  // We now only track keys we care about: "w" for forward, "f" for shoot, and "j" for jump.
  const [keys, setKeys] = useState({ w: false, f: false, j: false });
  const [animation, setAnimation] = useState(initialState.animation || "Idle");
  const [isJumping, setIsJumping] = useState(false);
  const [health, sethealth] = useState(initialState.health || 100);
  const lastShoot = useRef(0);
  const [zoom, setzoom] = useState(false);
  
  useEffect(() => {
    if (isUserPlayer) {
      const handleKeyDown = (e) => {
        // Toggle zoom with Z
        if (e.key.toLowerCase() === "z") {
          setzoom((prev) => !prev);
        }
        // Only register keys we use: w, f, j
        if (["w", "f", "j"].includes(e.key.toLowerCase())) {
          setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
        }
      };
      const handleKeyUp = (e) => {
        if (["w", "f", "j"].includes(e.key.toLowerCase())) {
          setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    } else {
      // For remote players, update state from initialState.
      rigidbody.current.setTranslation(initialState.position, true);
      character.current.rotation.y = initialState.rotation?.y || 0;
      setAnimation(initialState.animation || "Idle");
      sethealth(initialState.health);
    }
  }, [initialState, isUserPlayer]);

  useEffect(() => {
    if (login && isUserPlayer) {
      const intialposition = new Vector3(0, 20, 0);
      rigidbody.current.setTranslation(intialposition, true);
      setloginfalse();
    }
  }, [login, isUserPlayer, setloginfalse]);

  useFrame((_, delta) => {
    if (!rigidbody.current) return;

    if (isUserPlayer && !hit && !death) {
      // Get the camera’s forward vector (projected onto the XZ plane).
      const camForward = new Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();
      // Calculate the horizontal angle from the camera’s forward vector.
      const angle = Math.atan2(camForward.x, camForward.z);

      // Only move the player forward when W is pressed.
      if (keys.w) {
        const impulse = {
          x: camForward.x * MOVEMENT_SPEED * delta,
          y: 0,
          z: camForward.z * MOVEMENT_SPEED * delta,
        };
        rigidbody.current.applyImpulse(impulse, true);
        // Align the model with the camera’s forward direction.
        character.current.rotation.y = angle;
        // If shooting at the same time, play a combined animation.
        if (keys.f) {
          setAnimation("Run_Shoot");
        } else {
          setAnimation("Run");
        }
      } else {
        if (keys.f) {
          setAnimation("Idle_Shoot");
        } else {
          setAnimation("Idle");
        }
      }

      // Handle shooting using the camera’s forward angle.
      if (keys.f && Date.now() - lastShoot.current > FIRE_RATE) {
        lastShoot.current = Date.now();
        const position = rigidbody.current.translation();
        const bulletPosition = { x: position.x, y: position.y, z: position.z };
        fireBullet(bulletPosition, angle);
      }

      // Jumping.
      if (keys.j && !isJumping) {
        rigidbody.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
        setIsJumping(true);
        setAnimation("Jump");
      }

      // --- Update Camera Position ---
      // Instead of using a lookAt (which fixes rotation), we manually position the camera behind the player.
      const cameraDistanceY = zoom ? 5 : 20;
      const cameraDistanceZ = zoom ? 8 : 20;
      // The offset is opposite to the camera’s forward direction.
      const offset = camForward.clone().multiplyScalar(-cameraDistanceZ);
      offset.y = cameraDistanceY;
      const playerPos = rigidbody.current.translation();
      camera.position.set(
        playerPos.x + offset.x,
        playerPos.y + offset.y,
        playerPos.z + offset.z
      );
     

      // Update server state (rate limited)
      const currentTime = performance.now();
      if (currentTime - lastUpdateTime >= updateRateLimit) {
        lastUpdateTime = currentTime;
        socket.emit("updatePlayer", {
          name: playername,
          position: rigidbody.current.translation(),
          rotation: { y: character.current.rotation.y },
          animation,
          health,
        });
      }
    }

    // Handle hit and death for the user player.
    if (isUserPlayer && hit) {
      if (death) {
        setAnimation("Death");
        sethealth(initialState.health);
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateRateLimit) {
          lastUpdateTime = currentTime;
          socket.emit("updatePlayer", {
            name: playername,
            position: rigidbody.current.translation(),
            rotation: { y: character.current.rotation.y },
            animation,
            health,
          });
        }
        rigidbody.current.setEnabled(false);
      } else {
        setAnimation("HitReact");
        sethealth(initialState.health);
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateRateLimit) {
          lastUpdateTime = currentTime;
          socket.emit("updatePlayer", {
            name: playername,
            position: rigidbody.current.translation(),
            rotation: { y: character.current.rotation.y },
            animation,
            health,
          });
        }
      }
    }

    // Reset jump state when landing.
    if (isJumping) {
      const velocity = rigidbody.current.linvel();
      if (Math.abs(velocity.y) < 0.01) {
        setIsJumping(false);
      }
    }
  });

  return (
    <>
      {isUserPlayer && <CameraControls ref={controls} />}
      <RigidBody
        ref={rigidbody}
        lockRotations
        colliders={false}
        linearDamping={5}
        type="dynamic"
        userData={{ type: "player", playerId }}
      >
        <PlayerInfo
          soldiername={isUserPlayer ? playername : initialState.name}
          health={health}
        />
        <group ref={character}>
          <CharacterSoldier animation={animation} />
          {isUserPlayer && (
            <Crosshair
              position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
            />
          )}
        </group>
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
      </RigidBody>
    </>
  );
}

export default CharacterControls;

const PlayerInfo = ({ soldiername, health }) => {
  return (
    <Billboard position-y={2.5}>
      <mesh position-z={-0.1}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-1 * (1 - health / 100)}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Text position-y={0.36} fontSize={0.2}>
        {soldiername}
        <meshBasicMaterial color="green" />
      </Text>
    </Billboard>
  );
};

const Crosshair = (props) => {
  return (
    <group {...props}>
      <mesh position-z={1}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.9} />
      </mesh>
      <mesh position-z={2}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.85} />
      </mesh>
      <mesh position-z={3}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      <mesh position-z={4.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.7} transparent />
      </mesh>
      <mesh position-z={6.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.6} transparent />
      </mesh>
      <mesh position-z={9}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
*/

import { RigidBody, CapsuleCollider } from "@react-three/rapier";  
import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CharacterSoldier } from "./CharacterSoldier";

const FIRE_RATE = 380;
const MOVEMENT_SPEED = 30;
let lastUpdateTime = 0;
const JUMP_FORCE = 10;
const updateRateLimit = 1000 / 15;
const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.1,
  z: 0.8,
};

function CharacterControls({
  socket,
  soldierid,
  playerId,
  isUserPlayer,
  initialState,
  fireBullet,
  hit,
  death,
  login,
  setloginfalse,
  playername,
}) {
  const rigidbody = useRef();
  const character = useRef();
  const controls = useRef();
  const { camera } = useThree();

  // Track movement keys (W, A, S, D) plus F (shoot) and J (jump)
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    f: false,
    j: false,
  });
  const [animation, setAnimation] = useState(initialState.animation || "Idle");
  const [isJumping, setIsJumping] = useState(false);
  const [health, sethealth] = useState(initialState.health || 100);
  const lastShoot = useRef(0);
  const [zoom, setzoom] = useState(false);

  useEffect(() => {
    if (isUserPlayer) {
      const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        if (key === "z") {
          setzoom((prev) => !prev);
        }
        if (["w", "a", "s", "d", "f", "j"].includes(key)) {
          setKeys((prev) => ({ ...prev, [key]: true }));
        }
      };
      const handleKeyUp = (e) => {
        const key = e.key.toLowerCase();
        if (["w", "a", "s", "d", "f", "j"].includes(key)) {
          setKeys((prev) => ({ ...prev, [key]: false }));
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    } else {
      // For remote players, update state from the initialState.
      rigidbody.current.setTranslation(initialState.position, true);
      character.current.rotation.y = initialState.rotation?.y || 0;
      setAnimation(initialState.animation || "Idle");
      sethealth(initialState.health);
    }
  }, [initialState, isUserPlayer]);

  useEffect(() => {
    if (login && isUserPlayer) {
      const intialposition = new Vector3(200 - (Math.random()*400), 20, 200 - (Math.random()*400));
      rigidbody.current.setTranslation(intialposition, true);
      setloginfalse();
    }
  }, [login, isUserPlayer, setloginfalse]);

  useFrame((_, delta) => {
    if (!rigidbody.current) return;

    if (isUserPlayer && !hit && !death) {
      // Get the camera's forward vector and project it onto the XZ plane.
      const camForward = new Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      // Compute the camera's right vector.
      const camRight = new Vector3()
        .crossVectors(camForward, new Vector3(0, 1, 0))
        .normalize();

      // Build the movement direction using WASD relative to the camera.
      let moveDir = new Vector3();
      if (keys.w) moveDir.add(camForward);
      if (keys.s) moveDir.sub(camForward);
      if (keys.d) moveDir.add(camRight);
      if (keys.a) moveDir.sub(camRight);

      let movementAngle = null;
      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        // Apply movement impulse.
        const impulse = {
          x: moveDir.x * MOVEMENT_SPEED * delta,
          y: 0,
          z: moveDir.z * MOVEMENT_SPEED * delta,
        };
        rigidbody.current.applyImpulse(impulse, true);

        // Calculate the angle for the player model.
        movementAngle = Math.atan2(moveDir.x, moveDir.z);
        character.current.rotation.y = movementAngle;

        // Set the proper animation.
        if (keys.f) {
          setAnimation("Run_Shoot");
        } else {
          setAnimation("Run");
        }
      } else {
        if (keys.f) {
          setAnimation("Idle_Shoot");
        } else {
          setAnimation("Idle");
        }
      }

      // Shooting: fire in the direction the player is facing.
      if (keys.f && (Date.now() - lastShoot.current > FIRE_RATE)) {
        lastShoot.current = Date.now();
        const position = rigidbody.current.translation();
        const bulletPosition = { x: position.x, y: position.y, z: position.z };
        // Use the movement direction if available; otherwise default to the camera's forward angle.
        const fireAngle = character.current.rotation.y;
        fireBullet(bulletPosition, fireAngle);
      }

      // Jumping.
      if (keys.j && !isJumping) {
        rigidbody.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
        setIsJumping(true);
        setAnimation("Jump");
      }

      // --- Update Camera Position ---
      // Position the camera behind the player using the camera's current forward vector.
      const cameraDistanceY = zoom ? 3 : 20;
      const cameraDistanceZ = zoom ? 5 : 20;
      const offset = camForward.clone().multiplyScalar(-cameraDistanceZ);
      offset.y = cameraDistanceY;
      const playerPos = rigidbody.current.translation();
      camera.position.set(
        playerPos.x + offset.x,
        playerPos.y + offset.y,
        playerPos.z + offset.z
      );
 

      // Rate-limited server state update.
      const currentTime = performance.now();
      if (currentTime - lastUpdateTime >= updateRateLimit) {
        lastUpdateTime = currentTime;
        socket.emit("updatePlayer", {
          name: playername,
          position: rigidbody.current.translation(),
          rotation: { y: character.current.rotation.y },
          animation,
          health,
        });
      }
    }

    // Handle hit and death.
    if (isUserPlayer && hit) {
      if (death) {
        setAnimation("Death");
        sethealth(initialState.health);
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateRateLimit) {
          lastUpdateTime = currentTime;
          socket.emit("updatePlayer", {
            name: playername,
            position: rigidbody.current.translation(),
            rotation: { y: character.current.rotation.y },
            animation,
            health,
          });
        }
        rigidbody.current.setEnabled(false);
      } else {
        setAnimation("HitReact");
        sethealth(initialState.health);
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime >= updateRateLimit) {
          lastUpdateTime = currentTime;
          socket.emit("updatePlayer", {
            name: playername,
            position: rigidbody.current.translation(),
            rotation: { y: character.current.rotation.y },
            animation,
            health,
          });
        }
      }
    }

    // Reset jump state when landing.
    if (isJumping) {
      const velocity = rigidbody.current.linvel();
      if (Math.abs(velocity.y) < 0.01) {
        setIsJumping(false);
      }
    }
  });

  return (
    <>
      {isUserPlayer && <CameraControls ref={controls} />}
      <RigidBody
        ref={rigidbody}
        lockRotations
        colliders={false}
        linearDamping={5}
        type="dynamic"
        userData={{ type: "player", playerId }}
      >
        <PlayerInfo
          soldiername={isUserPlayer ? playername : initialState.name}
          health={health}
        />
        <group ref={character}>
          <CharacterSoldier animation={animation} />
          {isUserPlayer && (
            <Crosshair
              position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
            />
          )}
        </group>
        <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
      </RigidBody>
    </>
  );
}

export default CharacterControls;

const PlayerInfo = ({ soldiername, health }) => {
  return (
    <Billboard position-y={2}>
      <mesh position-z={-0.1}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-1 * (1 - health / 100)}>
        <planeGeometry args={[2, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Text position-y={0.2} fontSize={0.2}>
        {soldiername}
        <meshBasicMaterial color="green" />
      </Text>
    </Billboard>
  );
};

const Crosshair = (props) => {
  return (
    <group {...props}>
      <mesh position-z={1}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.9} />
      </mesh>
      <mesh position-z={2}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.85} />
      </mesh>
      <mesh position-z={3}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      <mesh position-z={4.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.7} transparent />
      </mesh>
      <mesh position-z={6.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.6} transparent />
      </mesh>
      <mesh position-z={9}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
