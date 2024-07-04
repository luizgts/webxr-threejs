import './style.css';
import * as THREE from "three";
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

document.addEventListener("DOMContentLoaded", () => {
  
  (async () => {

    // Bindings
    // ---------------------------------------------------------------
    const canvas = document.querySelector<HTMLCanvasElement>("#c");

    // Verifications
    // ---------------------------------------------------------------
    if(!canvas) return;

    // Setup
    // ---------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 3D Scene
    // ---------------------------------------------------------------

    // Box
    const boxBase = {
      geometry: new THREE.BoxGeometry(0.6, 0.6, 0.6),
      material: new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() })
    };
    const box = new THREE.Mesh(boxBase.geometry, boxBase.material);
    box.position.set(0, 0, -2);
    box.rotateX(35);
    box.rotateY(18);
    scene.add(box);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
   
    // XR Setup
    // ---------------------------------------------------------------
    renderer.xr.enabled = true;

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    // Controllers
    const controller = renderer.xr.getController(0);
    scene.add(controller);

    controller.addEventListener("select", () => {
      console.log("Select");
      const boxRandom = new THREE.Mesh(boxBase.geometry, boxBase.material);
      boxRandom.position.applyMatrix4(controller.matrixWorld);
      boxRandom.quaternion.setFromRotationMatrix(controller.matrixWorld);
      scene.add(boxRandom);
    });

    // Ar Button
    const arButton = ARButton.createButton(renderer, {
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    });
    document.body.appendChild(arButton);
    
  })();

});
