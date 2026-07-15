/* eslint-disable react/no-unknown-property */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// Adapted from react-bits' Lanyard. The base model (card.glb) and strap
// texture (lanyard-strap.png) are the same open-source assets from that
// project (github.com/DavidHDev/react-bits), self-hosted in /public/lanyard
// rather than bundled via webpack asset import - Next.js serves them as
// plain static files, which sidesteps needing any GLB/PNG loader config.
// Everything printed on the card face is ours. The front face tracks
// whichever philosophy pillar is active in the scroll-driven card stack
// (`activeIndex`, passed down from Philosophy.jsx's scroll effect): three
// pre-generated PNGs, one per pillar (hammer / gauge / coins - the same
// Phosphor glyphs used on the stack cards, "regular" weight rather than
// "bold" for a thinner, sharper line). All three are preloaded up front via
// a single batched `useLoader` call so switching `activeIndex` just swaps
// between already-decoded textures - no pop-in, no re-fetch.
//
// No glow, no added light. Two earlier passes tried a pointLight aimed at
// the card face, then an additive glow sprite parented to it - both read as
// "odd" in testing (a moving hotspot in the first case, a soft wash that
// didn't sit right in the second). Per feedback this is now deliberately
// plain: flat card texture, a plain three-light rig sized only for basic
// visibility, and a matte (near-zero clearcoat) material so there's no
// glossy highlight riding on top of the icon.
//
// Deliberately NOT using @react-three/drei here (no useGLTF/useTexture/
// Environment/Lightformer) - drei pulls in a large transitive dependency
// tree (detect-gpu, stats-gl, hls.js, camera-controls, troika-three-text,
// three-mesh-bvh, @react-spring/*, etc.) for the sake of four convenience
// wrappers we don't strictly need, and installing it was the one part of
// this feature that reliably crashed `npm install` (a reproducible
// `Invalid Version` arborist error, same crash on two different machines).
// Everything drei would have given us is reproduced directly below with
// plain three.js + @react-three/fiber's own `useLoader`: `GLTFLoader` and
// `TextureLoader` are core three.js loaders, and `nodes`/`materials` are
// built by hand from the loaded scene graph instead of drei's auto-parse.
extend({ MeshLineGeometry, MeshLineMaterial });

const CARD_GLB = '/lanyard/card.glb';
const STRAP_TEXTURE = '/lanyard/lanyard-strap.png';
const DEFAULT_BACK = '/lanyard/card-back.png';

// One front face per philosophy pillar, in the same order as Philosophy.jsx's
// `PILLARS` array (Craft / Performance / Pricing) - index-matched, not
// name-matched, so `activeIndex` can be used directly.
const FRONT_IMAGES = ['/lanyard/card-front-craft.png', '/lanyard/card-front-performance.png', '/lanyard/card-front-pricing.png'];

// Same accent RGB used across the page (HeroDotGrid / Services / Philosophy
// diagram), so the strap reads as an intentional brand-green lanyard - a
// literal "grass" cord - rather than an off-palette accessory.
const STRAP_COLOR = '#3fae6a';

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function LanyardBadge({
  position = [0, 0, 13],
  gravity = [0, -38, 0],
  fov = 20,
  activeIndex = 0,
  backImage = DEFAULT_BACK,
  imageFit = 'contain',
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 1.5]}
        gl={{ alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        {/* Plain, even two-light rig - just enough to read the card's shape
            and depth without any colored accent or hotspot. No point light,
            no HDRI/Environment reflections. */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 3, 4]} intensity={0.7} />

        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} activeIndex={activeIndex} backImage={backImage} imageFit={imageFit} />
        </Physics>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, activeIndex = 0, backImage, imageFit }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const gltf = useLoader(GLTFLoader, CARD_GLB);
  const texture = useLoader(THREE.TextureLoader, STRAP_TEXTURE);
  // Batched load - all three pillar faces come back as one array, decoded
  // once up front, so switching `activeIndex` later is just picking a
  // different already-ready texture.
  const frontTextures = useLoader(THREE.TextureLoader, FRONT_IMAGES);
  const frontTex = frontTextures[Math.min(activeIndex, frontTextures.length - 1)];
  const backTex = useLoader(THREE.TextureLoader, backImage);

  // Stand-in for drei's `useGLTF` return shape: walk the loaded scene once
  // and index meshes/materials by name, exactly the names this specific
  // model already ships (card / clip / clamp, base / metal).
  const { nodes, materials } = useMemo(() => {
    const nodeMap = {};
    const materialMap = {};
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        nodeMap[child.name] = child;
        if (child.material && child.material.name && !materialMap[child.material.name]) {
          materialMap[child.material.name] = child.material;
        }
      }
    });
    return { nodes: nodeMap, materials: materialMap };
  }, [gltf]);

  const cardMap = useMemo(() => {
    const baseMap = materials.base?.map;
    if (!baseMap) return null;
    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontTex?.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backTex?.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, imageFit, frontTex, backTex, materials.base]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  if (!nodes.card || !nodes.clip || !nodes.clamp) return null;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* Plain, matte card face - no clearcoat, no gloss. Just the
                flat printed texture read under even light. */}
            <mesh geometry={nodes.card.geometry}>
              <meshStandardMaterial map={cardMap} map-anisotropy={16} roughness={0.95} metalness={0.05} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.4} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color={STRAP_COLOR}
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
