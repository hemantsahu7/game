/*import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";
const Map = () => {
  const map = useGLTF("newmap.glb");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
  return (
    <>
      <RigidBody colliders="trimesh" type="fixed">
        <primitive object={map.scene} />
      </RigidBody>
    </>
  );
};
useGLTF.preload("/newmap.glb");
export default Map;*/

//map2
/*import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";
const Map = () => {
  const map = useGLTF("/chicken_gun_deserttown3/scene.gltf");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
  return (
    <>
      <RigidBody colliders="trimesh" type="fixed">
        <primitive object={map.scene} scale={[1.7,1.7,1.7]}/>
      </RigidBody>
    </>
  );
};
useGLTF.preload("/chicken_gun_deserttown3/scene.gltf");
export default Map;*/

//map3
/*
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";
const Map = () => {
  const map = useGLTF("/battle_guys_map_500th_model/scene.gltf");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
  return (
    <>
      <RigidBody colliders="trimesh" type="fixed">
        <primitive object={map.scene} scale={[1,1,1]}/>
      </RigidBody>
    </>
  );
};
useGLTF.preload("/battle_guys_map_500th_model/scene.gltf");
export default Map;*/

// map4
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";
const Map = () => {
  const map = useGLTF("/free_fire_maxx_new_clock_tower_map_download_free/scene.gltf");
  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
  return (
    <>
      <RigidBody colliders="trimesh" type="fixed">
        <primitive object={map.scene} scale={[100,100,100]}/>
      </RigidBody>
    </>
  );
};
useGLTF.preload("/free_fire_maxx_new_clock_tower_map_download_free/scene.gltf");
export default Map;

