"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";


export type BodyPart = {
  id:    string;
  label: string;
  emoji: string;
  x: number; y: number; z: number;
  w: number; h: number; d: number;
};

export const BODY_PARTS: BodyPart[] = [
  { id: "head",     label: "Head",          emoji: "🧠", x: 0,   y: 2.3,  z: 0, w: 0.5,  h: 0.55, d: 0.5  },
  { id: "neck",     label: "Neck / Throat", emoji: "🔊", x: 0,   y: 1.85, z: 0, w: 0.22, h: 0.3,  d: 0.22 },
  { id: "chest",    label: "Chest",         emoji: "❤️", x: 0,   y: 1.2,  z: 0, w: 0.7,  h: 0.7,  d: 0.4  },
  { id: "abdomen",  label: "Abdomen",       emoji: "🫁", x: 0,   y: 0.4,  z: 0, w: 0.65, h: 0.55, d: 0.38 },
  { id: "leftArm",  label: "Left Arm",      emoji: "💪", x: -0.9,y: 1.1,  z: 0, w: 0.25, h: 0.85, d: 0.25 },
  { id: "rightArm", label: "Right Arm",     emoji: "💪", x: 0.9, y: 1.1,  z: 0, w: 0.25, h: 0.85, d: 0.25 },
  { id: "leftLeg",  label: "Left Leg",      emoji: "🦵", x: -0.3,y: -0.7, z: 0, w: 0.28, h: 1.0,  d: 0.28 },
  { id: "rightLeg", label: "Right Leg",     emoji: "🦵", x: 0.3, y: -0.7, z: 0, w: 0.28, h: 1.0,  d: 0.28 },
];

const COLOR_NORMAL = "#1a3a5c";
const COLOR_HOVER  = "#2196f3";
const COLOR_ACTIVE = "#e53935";

type BodyViewerProps = {
  onPartClick:     (part: BodyPart) => void;
  activePartIds:   string[];  
};

export function BodyViewer({ onPartClick, activePartIds }: BodyViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const meshMapRef = useRef<Record<string, THREE.Mesh>>({});
  const hoveredRef = useRef<THREE.Mesh | null>(null);

  const handleClick = useCallback(onPartClick, []);

  useEffect(() => {
    const container = mountRef.current!;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── SCENE ─────────────────────────────────
    // Container for all 3D objects, lights, cameras
    const scene = new THREE.Scene();

    // ── CAMERA ────────────────────────────────
    // PerspectiveCamera(fov, aspect, near, far)
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.8, 6);

    // ── RENDERER ──────────────────────────────
    // Draws the scene onto a <canvas> element
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── LIGHTS ────────────────────────────────
    // MeshStandardMaterial requires lights to show color
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0x90caf9, 1.2);
    dir.position.set(3, 5, 5);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0x1565c0, 0.6);
    rim.position.set(-3, -2, -3);
    scene.add(rim);

    // ── BUILD MESHES ──────────────────────────
    BODY_PARTS.forEach((part) => {
      const geo  = new THREE.BoxGeometry(part.w, part.h, part.d);
      const mat  = new THREE.MeshStandardMaterial({
        color:       new THREE.Color(COLOR_NORMAL),
        roughness:   0.4,
        metalness:   0.3,
        transparent: true,
        opacity:     0.92,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(part.x, part.y, part.z);
      mesh.userData = { id: part.id };   
      scene.add(mesh);
      meshMapRef.current[part.id] = mesh;
    });

    // ── RAYCASTING ────────────────────────────
    // Shoots a ray from camera through mouse coords,
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    function toNDC(e: MouseEvent) {
      // Convert pixel coords to -1..+1 range
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    }

    function onMove(e: MouseEvent) {
      toNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children);

      // Reset previous hover
      if (hoveredRef.current) {
        const id = hoveredRef.current.userData.id as string;
        (hoveredRef.current.material as THREE.MeshStandardMaterial).color.set(
          activePartIds.includes(id) ? COLOR_ACTIVE : COLOR_NORMAL
        );
        hoveredRef.current = null;
        container.style.cursor = "default";
      }

      if (hits.length > 0 && hits[0].object.userData.id) {
        const mesh = hits[0].object as THREE.Mesh;
        (mesh.material as THREE.MeshStandardMaterial).color.set(COLOR_HOVER);
        hoveredRef.current = mesh;
        container.style.cursor = "pointer";
      }
    }

    function onClick(e: MouseEvent) {
      toNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children);
      if (hits.length > 0) {
        const id   = hits[0].object.userData.id as string;
        const part = BODY_PARTS.find((p) => p.id === id);
        if (part) handleClick(part);
      }
    }

    container.addEventListener("mousemove", onMove);
    container.addEventListener("click",     onClick);

    // ── ANIMATION LOOP ────────────────────────
    
    let frameId: number;
    let t = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 0.008;
      scene.rotation.y = Math.sin(t * 0.3) * 0.2;
      scene.position.y = Math.sin(t * 0.5) * 0.03;
    
      renderer.render(scene, camera);
    }
    animate();

    // ── RESIZE ────────────────────────────────
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix(); 
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ── CLEANUP ───────────────────────────────
    
    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("click",     onClick);
      window.removeEventListener("resize",       onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Recolor meshes when symptoms change
  useEffect(() => {
    Object.entries(meshMapRef.current).forEach(([id, mesh]) => {
      (mesh.material as THREE.MeshStandardMaterial).color.set(
        activePartIds.includes(id) ? COLOR_ACTIVE : COLOR_NORMAL
      );
    });
  }, [activePartIds]);

  return <div ref={mountRef} className="w-full h-full rounded-xl" />;
}