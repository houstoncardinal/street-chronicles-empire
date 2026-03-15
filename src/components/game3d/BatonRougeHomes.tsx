import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

// LSU-themed Colonial Home - typical of Baton Rouge
function LSUColonialHome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main building - white colonial style */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.7} />
      </mesh>
      
      {/* Roof - dark gray */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[6.5, 1, 5.5]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>
      
      {/* Columns - front porch */}
      {[-2.2, -0.7, 0.7, 2.2].map((x, i) => (
        <mesh key={i} position={[x, 2, 2.6]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Porch roof */}
      <mesh position={[0, 4.1, 2.6]}>
        <boxGeometry args={[5, 0.2, 1.2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>
      
      {/* Door - purple and gold LSU colors */}
      <mesh position={[0, 1.5, 2.51]}>
        <planeGeometry args={[1.2, 3]} />
        <meshStandardMaterial color="#461663" roughness={0.5} />
      </mesh>
      
      {/* Door frame - gold */}
      <mesh position={[0, 1.5, 2.52]}>
        <boxGeometry args={[1.4, 3.2, 0.1]} />
        <meshStandardMaterial color="#bfa540" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Windows */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 2.2, 2.51]}>
            <planeGeometry args={[1, 1.2]} />
            <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[x, 2.2, 2.52]}>
            <boxGeometry args={[1.2, 1.4, 0.1]} />
            <meshStandardMaterial color="#461663" roughness={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* Side windows */}
      {[-2.5, 2.5].map((x, i) => (
        <mesh key={i} position={[3.01, 2, x > 0 ? 1 : -1]}>
          <planeGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
        </mesh>
      ))}
      
      {/* Steps */}
      <mesh position={[0, 0.1, 3.2]}>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color="#a09080" roughness={0.8} />
      </mesh>
      
      {/* LSU flag pole */}
      <mesh position={[3.5, 3, -2]}>
        <cylinderGeometry args={[0.05, 0.05, 6, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
      <mesh position={[3.5, 6.2, -2]}>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#461663" />
      </mesh>
    </group>
  );
}

// Greek House - Fraternity style
function FraternityHouse({ position, color = '#8B4513' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Main structure - 2 story */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[8, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 7.5, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[6, 2.5, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      
      {/* Columns */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 3.1]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 7, 8]} />
          <meshStandardMaterial color="#f0f0e8" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Upper deck/balcony */}
      <mesh position={[0, 5, 3.5]}>
        <boxGeometry args={[6, 0.3, 1.5]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      
      {/* Balcony rail */}
      <mesh position={[0, 5.7, 3.8]}>
        <boxGeometry args={[6, 0.15, 0.1]} />
        <meshStandardMaterial color="#f0f0e8" roughness={0.6} />
      </mesh>
      
      {/* Front door */}
      <mesh position={[0, 2, 3.01]}>
        <planeGeometry args={[1.5, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.2} />
      </mesh>
      
      {/* Large windows ground floor */}
      {[-2.5, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 2.5, 3.01]}>
          <planeGeometry args={[1.8, 2.5]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.2} />
        </mesh>
      ))}
      
      {/* Windows upper floor */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 5.5, 3.01]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.15} />
        </mesh>
      ))}
      
      {/* Greek letters decoration */}
      <mesh position={[0, 7, 3.02]}>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#bfa540" metalness={0.4} roughness={0.3} />
      </mesh>
      
      {/* Lawn/grass base */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Suburban Baton Rouge Home
function SuburbanHome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main house body */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[5, 3.5, 4]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.8} />
      </mesh>
      
      {/* Garage */}
      <mesh position={[2.8, 1.25, 0]} castShadow>
        <boxGeometry args={[2, 2.5, 4]} />
        <meshStandardMaterial color="#c0b090" roughness={0.85} />
      </mesh>
      
      {/* Garage door */}
      <mesh position={[2.8, 1.25, 2.01]}>
        <planeGeometry args={[1.6, 2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4, 1.5, 4]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      
      {/* Front door */}
      <mesh position={[0, 1, 2.01]}>
        <planeGeometry args={[1, 2]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      
      {/* Window */}
      <mesh position={[-1.5, 2, 2.01]}>
        <planeGeometry args={[1, 1.2]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
      </mesh>
      
      {/* Driveway */}
      <mesh position={[2.8, 0.02, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      
      {/* Mailbox with LSU colors */}
      <mesh position={[-3, 0.6, 2]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
        <meshStandardMaterial color="#461663" />
      </mesh>
    </group>
  );
}

// Split-level home
function SplitLevelHome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Upper level */}
      <mesh position={[0, 2.5, -1]} castShadow>
        <boxGeometry args={[5, 5, 4]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.8} />
      </mesh>
      
      {/* Lower level (garage/den) */}
      <mesh position={[1.5, 1.25, 1.5]} castShadow>
        <boxGeometry args={[3.5, 2.5, 3]} />
        <meshStandardMaterial color="#d0c0a8" roughness={0.85} />
      </mesh>
      
      {/* Upper roof */}
      <mesh position={[0, 5.5, -1]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4, 1.5, 4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      
      {/* Lower roof section */}
      <mesh position={[1.5, 2.75, 1.5]} castShadow>
        <boxGeometry args={[3.8, 0.3, 3.3]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      
      {/* Upper windows */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 3, -0.99]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.15} />
        </mesh>
      ))}
      
      {/* Garage door lower */}
      <mesh position={[1.5, 1.25, 3.01]}>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.7} />
      </mesh>
      
      {/* Entry door upper */}
      <mesh position={[0, 1.3, -0.99]}>
        <planeGeometry args={[1, 2.6]} />
        <meshStandardMaterial color="#461663" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Baton Rouge Ranch Style Home
function RanchHome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Single story main body */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[7, 3, 5]} />
        <meshStandardMaterial color="#f0e6d2" roughness={0.8} />
      </mesh>
      
      {/* Low pitch roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[7.5, 0.4, 5.5]} />
        <meshStandardMaterial color="#555555" roughness={0.85} />
      </mesh>
      
      {/* Carport */}
      <mesh position={[2.5, 1.5, 2]} castShadow>
        <boxGeometry args={[2.5, 2, 3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      
      {/* Carport roof */}
      <mesh position={[2.5, 2.6, 2]}>
        <boxGeometry args={[3, 0.2, 3.5]} />
        <meshStandardMaterial color="#555555" roughness={0.85} />
      </mesh>
      
      {/* Front door */}
      <mesh position={[0, 1, 2.51]}>
        <planeGeometry args={[1.2, 2]} />
        <meshStandardMaterial color="#3a2820" roughness={0.6} />
      </mesh>
      
      {/* Picture window */}
      <mesh position={[-2, 1.5, 2.51]}>
        <planeGeometry args={[2, 1.8]} />
        <meshStandardMaterial color="#aaddff" emissive="#aaddff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Bedroom windows */}
      <mesh position={[2, 1.5, 2.51]}>
        <planeGeometry args={[1, 1.2]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
      </mesh>
      
      {/* Patio/porch concrete */}
      <mesh position={[0, 0.05, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#909090" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Modern Baton Rouge Home
function ModernHome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main modern block */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Accent wing */}
      <mesh position={[-3.5, 1.5, 0.5]} castShadow>
        <boxGeometry args={[2, 3, 4]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      
      {/* Flat roof with trim */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[6.2, 0.2, 5.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Large floor-to-ceiling windows */}
      <mesh position={[1, 2, 2.51]}>
        <planeGeometry args={[3, 3.5]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
      
      {/* Window frames */}
      <mesh position={[1, 2, 2.52]}>
        <boxGeometry args={[3.2, 3.7, 0.1]} />
        <meshStandardMaterial color="#bfa540" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Front door - accent color */}
      <mesh position={[-1.5, 1.2, 2.51]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial color="#461663" roughness={0.4} />
      </mesh>
      
      {/* Concrete driveway */}
      <mesh position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#606060" roughness={0.9} />
      </mesh>
      
      {/* Landscaping accent */}
      <mesh position={[-4.5, 0.3, 2]}>
        <boxGeometry args={[1, 0.6, 3]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.9} />
      </mesh>
    </group>
  );
}

// LSU Campus Building style
function CampusBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main academic building */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[10, 8, 8]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.8} />
      </mesh>
      
      {/* Central tower section */}
      <mesh position={[0, 8, 0]} castShadow>
        <boxGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color="#c4b498" roughness={0.85} />
      </mesh>
      
      {/* Dome/cupola */}
      <mesh position={[0, 10, 0]} castShadow>
        <sphereGeometry args={[1.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#461663" roughness={0.6} />
      </mesh>
      
      {/* Columns entrance */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 3, 4.1]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6, 8]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Entrance pediment */}
      <mesh position={[0, 5.5, 4.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[4, 1, 0.5]} />
        <meshStandardMaterial color="#461663" roughness={0.7} />
      </mesh>
      
      {/* Many windows */}
      {[-3, 0, 3].map((x, xi) => (
        <group key={xi}>
          {[1.5, 3, 4.5].map((y, yi) => (
            <mesh key={yi} position={[x, y, 4.01]}>
              <planeGeometry args={[1.5, 1.8]} />
              <meshStandardMaterial color="#aaddff" emissive="#aaddff" emissiveIntensity={0.15} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* LSU seal above door */}
      <mesh position={[0, 6.2, 4.02]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#bfa540" metalness={0.4} roughness={0.3} />
      </mesh>
      
      {/* Stairs */}
      <mesh position={[0, 0.1, 5.5]}>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial color="#a09080" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Student Apartment Complex
function StudentApartment({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main building - 2 story */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[12, 6, 6]} />
        <meshStandardMaterial color="#c0b0a0" roughness={0.85} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[12.5, 0.4, 6.5]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.85} />
      </mesh>
      
      {/* Multiple doors for units */}
      {[-4, -1.3, 1.3, 4].map((x, i) => (
        <mesh key={i} position={[x, 1.3, 3.01]}>
          <planeGeometry args={[1.5, 2.6]} />
          <meshStandardMaterial color="#4a3728" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Windows for each unit */}
      {[-4, -1.3, 1.3, 4].map((x, xi) => (
        <group key={xi}>
          <mesh position={[x, 4, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
          </mesh>
          <mesh position={[x - 0.7, 4, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Balconies */}
      {[-4, -1.3, 1.3, 4].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 2.5, 3.5]}>
            <boxGeometry args={[1.8, 0.15, 1.2]} />
            <meshStandardMaterial color="#505050" roughness={0.8} />
          </mesh>
          <mesh position={[x, 3.3, 3.5]}>
            <boxGeometry args={[0.1, 1.5, 0.1]} />
            <meshStandardMaterial color="#606060" />
          </mesh>
          <mesh position={[x, 3.3, 4]}>
            <boxGeometry args={[0.1, 1.5, 0.1]} />
            <meshStandardMaterial color="#606060" />
          </mesh>
        </group>
      ))}
      
      {/* Parking lot */}
      <mesh position={[0, 0.02, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Bayou-side Louisiana Home (closer to water)
function BayouMansion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Elevated main structure */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[7, 4, 6]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.75} />
      </mesh>
      
      {/* Second floor overhang */}
      <mesh position={[1, 4.5, 0]} castShadow>
        <boxGeometry args={[5, 2, 5]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.8} />
      </mesh>
      
      {/* Wrap-around porch */}
      <mesh position={[0, 1.25, 3.5]}>
        <boxGeometry args={[8, 2.5, 1.5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      
      {/* Porch railings */}
      <mesh position={[0, 2, 4]}>
        <boxGeometry args={[8, 0.1, 0.1]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>
      
      {/* Stilts/piers for elevation */}
      {[[-3, -2.5], [-3, 2.5], [3, -2.5], [3, 2.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]}>
          <cylinderGeometry args={[0.2, 0.2, 2, 6]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Metal roof */}
      <mesh position={[0, 5.8, 0]} castShadow>
        <boxGeometry args={[7.5, 0.15, 6.5]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* French doors */}
      <mesh position={[-1.5, 2, 3.01]}>
        <planeGeometry args={[1.8, 2.8]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.2} transparent opacity={0.6} />
      </mesh>
      
      {/* Door */}
      <mesh position={[1.5, 1.5, 3.01]}>
        <planeGeometry args={[1.2, 3]} />
        <meshStandardMaterial color="#461663" roughness={0.5} />
      </mesh>
      
      {/* Deck/platform over water */}
      <mesh position={[0, 0.15, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      
      {/* Dock extending into water */}
      <mesh position={[0, 0.15, 8]}>
        <boxGeometry args={[3, 0.15, 5]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
    </group>
  );
}

export {
  LSUColonialHome,
  FraternityHouse,
  SuburbanHome,
  SplitLevelHome,
  RanchHome,
  ModernHome,
  CampusBuilding,
  StudentApartment,
  BayouMansion
};
