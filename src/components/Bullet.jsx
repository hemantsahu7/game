
import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicMaterial, } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { CuboidCollider } from "@react-three/rapier";


const BULLET_SPEED = 25;

const bulletMaterial = new MeshBasicMaterial({
  color: "hotpink",
  toneMapped: false,
});


bulletMaterial.color.multiplyScalar(42);

export function Bullet({ socket, playerId, bullet }) {
  const rigidbody = useRef();
  const group = useRef();

 
 

  useEffect(() => {
    // Calculate initial velocity
    const velocity = {
      x: Math.sin(bullet.angle) * BULLET_SPEED,
      y: 0,
      z: Math.cos(bullet.angle) * BULLET_SPEED,
    };

    // Adjust position based on the time elapsed since the bullet was fired
    const timeElapsed = (Date.now() - bullet.timestamp) / 1000; // Convert ms to seconds
    const correctedPosition = {
      x: bullet.position.x + velocity.x * timeElapsed,
      y: bullet.position.y + velocity.y * timeElapsed,
      z: bullet.position.z + velocity.z * timeElapsed,
    };

    // Set the position and velocity of the bullet in the physics world
    if (rigidbody.current) {
      rigidbody.current.setTranslation(correctedPosition, true);
      rigidbody.current.setLinvel(velocity, true);
    }
  }, [bullet]);

  useFrame(() => {
    // Emit bullet position updates only for the player who fired it
    if (bullet.playerId === playerId && rigidbody.current) {
      const timeAlive = Date.now() - bullet.starting; // milliseconds
      if(bullet.position.x>500 || bullet.position.x <-500 || bullet.position.z>500 || bullet.position.z<-500 || timeAlive>3000){
        socket.emit("removeBullet", bullet.id);
      }
      else{
        const newPosition = rigidbody.current.translation();
      socket.emit("updateBullet", {
        id: bullet.id,
        position: newPosition,
        starting:bullet.starting,
        timestamp: Date.now(),
      });

      }
      
    }
  });

 

  return (
    <group rotation-y={bullet.angle} ref={group}>
      <RigidBody
        ref={rigidbody}
        gravityScale={0}
        sensor
        ccd = {true}
        onIntersectionEnter={(e) => {
          console.log("collision happened");
          console.log("bullet touch collider of player");
          if (!e.other.rigidBody.userData) {
            socket.emit("removeBullet", bullet.id);
          }
          if (
            e.other.rigidBody.userData?.type === "player" &&
            e.other.rigidBody.userData?.playerId !== bullet.playerId && bullet.hasHit===false
          ) {
            if (rigidbody.current) {
                rigidbody.current.setEnabled(false);
                console.log("collider of bullet is removed"); // Disables further physics/collisions
              }
              bullet.hasHit = true;
            console.log("target is player");
            socket.emit("removeBullet", bullet.id);
            socket.emit("playerHit",{hitPlayerId:e.other.rigidBody.userData.playerId})
            // Optional: disable collider to prevent multiple hits (prevent future collisions)
             
            
          } 
        }}
        userData={{
          type: "bullet",
          id: bullet.id,
          shooterid: bullet.playerId,
        }}
      >
       <CuboidCollider args={[0.2, 0.2, 1]} position={[0, 0, 0.25]} />

        <mesh position-z={0.25} material={bulletMaterial}>
            <boxGeometry args={[0.05, 0.05, 0.3]} />
        </mesh>
        
        
      </RigidBody>
      
    </group>
  );
}
export default Bullet;























