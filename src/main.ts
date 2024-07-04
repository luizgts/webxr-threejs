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
    // const box = new THREE.Mesh(boxBase.geometry, boxBase.material);
    // box.position.set(0, 0, -2);
    // scene.add(box);

    // Reticle
    const reticleBase = {
      geometry: new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI/2),
      material: new THREE.MeshBasicMaterial({ color: 0xffffff})
    };
    const reticle = new THREE.Mesh(reticleBase.geometry, reticleBase.material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // XR Setup
    // ---------------------------------------------------------------
    renderer.xr.enabled = true;

    // Ar Button
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    });
    document.body.appendChild(arButton);

    // Controllers
    const controller = renderer.xr.getController(0);
    scene.add(controller);

    controller.addEventListener("select", () => {
      const boxRandom = new THREE.Mesh(boxBase.geometry, boxBase.material);
      boxRandom.position.setFromMatrixPosition(reticle.matrix);
      scene.add(boxRandom);
    });

    // On Session Start
    renderer.xr.addEventListener("sessionstart", async () => {
      const session = renderer.xr.getSession();

      // Current position of viewer device
      const viewerReferenceSpace = await session!.requestReferenceSpace("viewer");
      
      const hitTestSource = await session!.requestHitTestSource!({
        space: viewerReferenceSpace
      });

      renderer.setAnimationLoop((_, frame) => {

        if (frame && hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          // Hit test Result
          if (hitTestResults.length > 0) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitPose = hitTestResults[0].getPose(referenceSpace as XRSpace);
            
            // Reticle Position
            reticle.visible = true;
            reticle.matrix.fromArray(hitPose!.transform.matrix);
          } else {
            reticle.visible = false;
          }
        }

        renderer.render(scene, camera);

      });

    });

    // On Session End
    renderer.xr.addEventListener("sessionend", async () => {

    });
    
  })();

});
