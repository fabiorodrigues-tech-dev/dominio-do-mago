'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sparkles, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface AuraAvatar3DProps {
  auraRadius?: number; // 1.0 (Nível 1) até 5.0 (Nível Máximo - 50cm)
  modelUrl?: string;   // Caminho ou URL do modelo 3D
}

// -------------------------------------------------------------
// Componente Renderizador do Mago
// -------------------------------------------------------------
function ModelRenderer() {
  const group = useRef<THREE.Group>(null);
  
  // Aponta estaticamente para o avatar local na pasta pública
  const { scene, animations } = useGLTF('/avatar_fabio.glb');
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length > 0 && actions) {
      // Ativa a animação mágica de Idle ou Spellcasting do Mago
      const preferredAnim = names.find(n => 
        n.toLowerCase().includes('idle') || 
        n.toLowerCase().includes('spellcast')
      ) || names[0];

      if (preferredAnim && actions[preferredAnim]) {
        actions[preferredAnim]?.reset().fadeIn(0.6).play();
      }
    }
  }, [actions, names]);

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={[1.8, 1.8, 1.8]} 
        position={[0, -1.2, 0]} 
      />
    </group>
  );
}

// -------------------------------------------------------------
// Fallback Místico de Invocação (Loader Neon 3D)
// -------------------------------------------------------------
function SummoningLoader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 2.0;
      meshRef.current.position.y = Math.sin(t * 3.0) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 1.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Cristal Central de Invocação */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial 
          color="#d946ef"
          emissive="#a855f7"
          emissiveIntensity={1.8}
          wireframe
        />
      </mesh>

      {/* Anel de Conjuramento Rúnico */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.4, 32]} />
        <meshBasicMaterial 
          color="#22d3ee" 
          side={THREE.DoubleSide} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Cena com Efeitos de Aura no Nível Máximo
// -------------------------------------------------------------
function AvatarScene({ auraRadius = 5.0 }: { auraRadius?: number }) {
  // Garante que para testes de visualização máxima o raio seja 5.0
  const effectiveRadius = auraRadius >= 1.0 ? auraRadius : 5.0;
  const isMaxLevel = effectiveRadius >= 4.9;

  return (
    <group>
      {/* 1. Camada Arcana de Partículas Cósmicas */}
      <Sparkles
        count={isMaxLevel ? 160 : Math.floor(effectiveRadius * 30)} 
        scale={effectiveRadius * 1.6}
        size={isMaxLevel ? 6.5 : 4}
        speed={isMaxLevel ? 0.7 : 0.4}
        opacity={0.9}
        color="#c084fc"
        position={[0, 0, 0]}
      />

      {/* 2. Camada Eletrizante Ciano / Tempestade Arcana */}
      <Sparkles
        count={isMaxLevel ? 90 : Math.floor(effectiveRadius * 18)} 
        scale={effectiveRadius * 2.0}
        size={isMaxLevel ? 4.5 : 2.5}
        speed={isMaxLevel ? 0.5 : 0.25}
        opacity={0.75}
        color="#22d3ee"
        position={[0, 0, 0]}
      />

      {/* 3. Poeira Estelar Dourada no Nível Máximo (Transcendente) */}
      {isMaxLevel && (
        <Sparkles
          count={70} 
          scale={effectiveRadius * 2.4}
          size={5.0}
          speed={0.9}
          opacity={0.85}
          color="#facc15"
          position={[0, 0, 0]}
        />
      )}

      {/* Renderização do Modelo com Suspense e Loader Elegante */}
      <Suspense fallback={<SummoningLoader />}>
        <ModelRenderer />
      </Suspense>
    </group>
  );
}

// -------------------------------------------------------------
// Componente Principal Exportado
// -------------------------------------------------------------
export default function AuraAvatar3D({ auraRadius = 5.0 }: AuraAvatar3DProps) {
  const currentRadius = auraRadius || 5.0;

  return (
    <div className="w-full h-full min-h-[360px] md:min-h-[420px] bg-transparent rounded-3xl overflow-hidden relative select-none">
      {/* Tag de Nível Máximo Cyberpunk */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 border border-container-border px-3 py-1.5 rounded-full backdrop-blur-xl shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 uppercase tracking-wider">
          AURA MÁXIMA • NÍVEL 5 (50cm)
        </span>
      </div>

      <Canvas camera={{ position: [0, 0.9, 3.6], fov: 42 }}>
        {/* Luzes da Atmosfera */}
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 7, 4]} intensity={2.0} color="#f5d0fe" />
        <pointLight position={[2, 3, 2]} intensity={3.0} color="#d946ef" />
        <pointLight position={[-2, 1, -2]} intensity={2.5} color="#06b6d4" />
        <Environment preset="city" />

        {/* Cena Principal */}
        <AvatarScene auraRadius={currentRadius} />

        {/* Sombra de Contato posicionada rente aos pés do Mago */}
        <ContactShadows 
          position={[0, -1.21, 0]} 
          opacity={0.75} 
          scale={4.2} 
          blur={2.0} 
          far={3.5} 
        />

        {/* Controles Livres de Rotação Orbital */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>
    </div>
  );
}

// Pré-carregamento imediato do modelo estático
useGLTF.preload('/avatar_fabio.glb');
