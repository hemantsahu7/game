

import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
/*import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { SkeletonUtils } from "three-stdlib";*/
import { useFrame } from "@react-three/fiber";
import { MeshBasicMaterial, } from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";



const BULLET_SPEED = 10;

const bulletMaterial = new MeshBasicMaterial({
  color: "hotpink",
  toneMapped: false,
});


bulletMaterial.color.multiplyScalar(42);

export function Bullet({ socket, playerId, bullet, decreasehealth, oncollision, endcollision }) {
  const rigidbody = useRef();
  const group = useRef();

  // Load the .obj bullet model
 /*const model = useLoader(OBJLoader, "/bullet.obj"); // Replace with your actual path
 
 const clonedModel = useMemo(() => SkeletonUtils.clone(model), [model]);*/
 

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
      if(bullet.position.x>500 || bullet.position.x <-500 || bullet.position.z>500 || bullet.position.z<-500){
        socket.emit("removeBullet", bullet.id);
      }
      else{
        const newPosition = rigidbody.current.translation();
      socket.emit("updateBullet", {
        id: bullet.id,
        position: newPosition,
        timestamp: Date.now(),
      });

      }
      
    }
  });

  /*useEffect(() => {
    // Apply shadows to all meshes in the cloned model
    clonedModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedModel]);*/

  return (
    <group rotation-y={bullet.angle} ref={group}>
      <RigidBody
        ref={rigidbody}
        gravityScale={0}
        sensor
        ccd = {true}
        onIntersectionEnter={(e) => {
          console.log("collision happened");
          if (!e.other.rigidBody.userData) {
            socket.emit("removeBullet", bullet.id);
          }
          if (
            e.other.rigidBody.userData?.type === "player" &&
            e.other.rigidBody.userData?.playerId !== bullet.playerId
          ) {
            socket.emit("removeBullet", bullet.id);
            decreasehealth(e.other.rigidBody.userData.playerId);
            oncollision();
            endcollision();
          } 
        }}
        userData={{
          type: "bullet",
          id: bullet.id,
          shooterid: bullet.playerId,
        }}
      >
        <mesh position-z={0.25} material={bulletMaterial}>
            <boxGeometry args={[0.05, 0.05, 0.3]} />
        </mesh>
        
        
      </RigidBody>
      
    </group>
  );
}
export default Bullet;


//<primitive object={clonedModel} scale={[0.001, 0.001, 0.0012]} position={[0, 0, 0.25]} />
/*<EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.7} 
                 luminanceSmoothing={0.2} 
                 intensity={0.5} 
                 mipmapBlur 
                />
      </EffectComposer>*/























