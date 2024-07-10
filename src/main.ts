import './style.css';
import * as THREE from "three";
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

document.addEventListener("DOMContentLoaded", () => {

  // Vars
  let renderer: THREE.WebGLRenderer, 
      camera: THREE.PerspectiveCamera, 
      scene: THREE.Scene,
      reticle: THREE.Object3D,
      group: THREE.Object3D,
      hitTestSource: XRHitTestSource | undefined,
      session: XRSession | null,
      sessionStart: boolean = false,
      orbitControls: OrbitControls,
      raycaster: THREE.Raycaster,
      controller: THREE.XRTargetRaySpace,
      pointer: THREE.Vector2,
      intersects: Array<THREE.Intersection>;
  
  init();
  async function init() {
    
    // Setup Renderer
    // ---------------------------------------------------------------
    const canvas = document.querySelector<HTMLCanvasElement>("#c");
    if(!canvas) return;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    renderer.setAnimationLoop(render);
    
    // Setup Scene
    // ---------------------------------------------------------------
    scene = new THREE.Scene();

    // Setup Lights
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
    
    // Setup Camera
    // ---------------------------------------------------------------
    camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.set(0, 1.6, 2);
    camera.updateProjectionMatrix();

    // Setup AR Button
    // ---------------------------------------------------------------
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    });
    document.body.appendChild(arButton);
    
    // Setup AR Controllers
    // ---------------------------------------------------------------
    controller = renderer.xr.getController(0);
    scene.add(controller);
    
    // Setup Orbit Controls
    // ---------------------------------------------------------------
    orbitControls = new OrbitControls(camera, renderer.domElement);
    
    // Setup Raycaster
    // ---------------------------------------------------------------
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // 3D Scene
    // ---------------------------------------------------------------
    group = new THREE.Group();
    scene.add(group);
    
    group.add(addBox(0, 0, 0));
    group.add(addBox(1, 0, 0));
    group.add(addBox(-1, 0, 0));
    
    // Reticle
    const reticleBase = {
      geometry: new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI/2),
      material: new THREE.MeshBasicMaterial({ color: 0xffffff})
    };
    reticle = new THREE.Mesh(reticleBase.geometry, reticleBase.material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    
    // Events
    // ---------------------------------------------------------------
    
    controller.addEventListener("select", onSelect);

    renderer.xr.addEventListener("sessionstart", onSessionStart);

    renderer.xr.addEventListener("sessionend", onSessionEnd);

    window.addEventListener("resize", onWindowResize);

    window.addEventListener("pointermove", onPointerMove);

    window.addEventListener("click", onPointerClick);
    
  };

  function render(_: number, frame: XRFrame) {

    orbitControls.update();

    if(sessionStart) {

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

    }

    renderer.render(scene, camera);

  }

  function onPointerMove(e: PointerEvent) {
    pointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
       -(e.clientY / window.innerHeight) * 2 + 1
    );
  }

  function onPointerClick() {

    raycaster.setFromCamera(pointer, camera);

    intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      object.scale.set(1.5, 1.5, 1.5);
      // object.material.color.set(0xff0000);
      object.updateMatrix();
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onSelect() {

    const boxBase = {
      geometry: new THREE.BoxGeometry(0.6, 0.6, 0.6),
      material: new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() })
    };
    const boxRandom = new THREE.Mesh(boxBase.geometry, boxBase.material);
    boxRandom.position.setFromMatrixPosition(reticle.matrix);
    scene.add(boxRandom);

    // controller.updateMatrixWorld();
    // raycaster.setFromXRController(controller);
    // console.log(raycaster.intersectObjects( group.children, false ));
  }

  async function onSessionStart() {
    session = renderer.xr.getSession();
    const viewerReferenceSpace = await session!.requestReferenceSpace("viewer");
    
    hitTestSource = await session!.requestHitTestSource!({
      space: viewerReferenceSpace
    });

    scene.add(reticle);
    sessionStart = true;
  }

  async function onSessionEnd() {
    sessionStart = false;
    renderer.setAnimationLoop(render);
  }

  function addBox(x: number, y: number, z: number) {
    const boxBase = {
      geometry: new THREE.BoxGeometry(0.6, 0.6, 0.6),
      material: new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() })
    };
    const box = new THREE.Mesh(boxBase.geometry, boxBase.material);
    box.position.set(x, y, z);
    return box;
  }

});
