import { RigidBody } from '@react-three/rapier';

export function Headquarters() {
  return (
    <group position={[0, 0, -30]}>
      {/* Main HQ building */}
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[14, 10, 10]} />
          <meshStandardMaterial color="#0d0d10" roughness={0.7} metalness={0.3} />
        </mesh>
      </RigidBody>

      {/* Top accent border */}
      <mesh position={[0, 10.05, 0]}>
        <boxGeometry args={[14.2, 0.1, 10.2]} />
        <meshBasicMaterial color="#F000B8" />
      </mesh>

      {/* NBA neon sign - front */}
      <mesh position={[0, 7, 5.05]}>
        <planeGeometry args={[4, 1.2]} />
        <meshBasicMaterial color="#F000B8" />
      </mesh>

      {/* Smaller accent signs */}
      <mesh position={[-4, 4, 5.05]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshBasicMaterial color="#F000B8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[4, 4, 5.05]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshBasicMaterial color="#F000B8" transparent opacity={0.6} />
      </mesh>

      {/* Neon glow lights */}
      <pointLight position={[0, 7, 6]} color="#F000B8" intensity={15} distance={20} />
      <pointLight position={[0, 3, 6]} color="#F000B8" intensity={5} distance={10} />
      <pointLight position={[0, 5, -6]} color="#F000B8" intensity={3} distance={8} />

      {/* Door */}
      <mesh position={[0, 1.5, 5.06]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#080808" />
      </mesh>

      {/* Door frame accent */}
      <mesh position={[0, 3.1, 5.06]}>
        <planeGeometry args={[2.2, 0.08]} />
        <meshBasicMaterial color="#F000B8" transparent opacity={0.8} />
      </mesh>

      {/* Side accent lines */}
      {[-7.05, 7.05].map(x => (
        <mesh key={x} position={[x, 5, 0]}>
          <planeGeometry args={[0.08, 10]} />
          <meshBasicMaterial color="#F000B8" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Ground platform */}
      <RigidBody type="fixed" position={[0, 0.05, 3]}>
        <mesh receiveShadow>
          <boxGeometry args={[16, 0.1, 14]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Ground accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 8]}>
        <ringGeometry args={[1.5, 2, 16]} />
        <meshBasicMaterial color="#F000B8" transparent opacity={0.1} />
      </mesh>

      {/* Pillars */}
      {[-5, 5].map(x => (
        <RigidBody key={x} type="fixed" position={[x, 2.5, 5.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 5, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
