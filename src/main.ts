import './style.css';
import * as THREE from "three";

document.addEventListener("DOMContentLoaded", () => {
  
  (async () => {

    // Bindings
    // ---------------------------------------------------------------
    const arButton = document.querySelector<HTMLButtonElement>("#ar-button");
    const canvas = document.querySelector<HTMLCanvasElement>("#c");

    // Verifications
    // ---------------------------------------------------------------
    const isXRSupported = navigator.xr && await navigator.xr.isSessionSupported("immersive-ar");

    if (!isXRSupported) {
      arButton!.textContent = "Not Supported";
      arButton!.disabled = true;
      return;
    };

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
      material: new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    };
    const box = new THREE.Mesh(boxBase.geometry, boxBase.material);
    box.position.set(0, 0, -2);
    box.rotateX(35);
    box.rotateY(18);
    scene.add(box);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
   
    // Start Session
    // ---------------------------------------------------------------
    let currentSession: XRSession | undefined;
    const start = async () => {

      // Start XR Session
      currentSession = await navigator.xr?.requestSession("immersive-ar", {
        optionalFeatures: ["dom-overlay", "hit-test"],
        domOverlay: { root: document.body }
      });
      
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType("local");
      await renderer.xr.setSession(currentSession ?? null);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    }

    // End Session
    // ---------------------------------------------------------------
    const end = async () => {
      await currentSession?.end();
      renderer.clear();
      renderer.setAnimationLoop(null);
    }

    // Ar Button
    // ---------------------------------------------------------------
    arButton?.addEventListener("click", () => {
      if (!currentSession) {
        start();
        arButton.textContent = "End"
      } else {
        end();
        arButton.style.display = "none";
      }
    })

    
  })();

});
