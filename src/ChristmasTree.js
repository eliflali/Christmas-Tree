import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text} from "@react-three/drei";

const Star = () => {
    <img
    src={`${process.env.PUBLIC_URL}/christmas_tree_light.gif`} // Path to your GIF
    alt="Christmas Tree Light"
    className="christmas-tree-light"
  />
};

const Ornament = ({ position, color, noteName }) => {
    // Truncate name if longer than 8 characters
    const displayName = noteName.length > 8 ? `${noteName.slice(0, 8)}...` : noteName;
    
    return (
    <group position={position} renderOrder={1}>
      {/* Ornament */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Hanger */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 32]} />
        <meshStandardMaterial color="gold" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Note Name with enhanced visibility */}
      <Text
        position={[0, 0.05, 0.16]}
        fontSize={0.1}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="#000000"
      >
        {displayName}
      </Text>
    </group>
  )};
  
  const Tree = ({ notes }) => {
    const ornaments = [];
    const minHeight = 3;
    // Calculate required rows based on note count
    let totalOrnaments = 0;
    let rowCount = 0;
    while (totalOrnaments < notes.length) {
      rowCount++;
      totalOrnaments += rowCount;
    }
    rowCount = Math.max(minHeight, rowCount);

    const ornamentColors = [
        "#2ECC71", // Brighter green
        "#E74C3C", // Bright red
        "#F1C40F", // Bright yellow/gold
        "#3498DB", // Bright blue
        "#9B59B6", // Bright purple
    ];
  
    let index = 0;
    for (let row = 0; row < rowCount && index < notes.length; row++) {
      const ornamentsInRow = row + 1; // Each row has row+1 ornaments
      const height = -(row + 1) * 0.3; // Calculate height of the row
      const radius = 0.7 - (row / rowCount) * 0.4; // Decrease radius for each row
      const ornamentOffset = 0.6; // Offset to place ornaments above the cone surface
  
      for (let i = 0; i < ornamentsInRow && index < notes.length; i++) {
        const angle = (i / ornamentsInRow) * Math.PI * 2; // Spread ornaments evenly
        const x = height + ornamentOffset; // X position on the cone surface
        const z = radius * Math.sin(angle) +1; // Z position on the cone surface
        const y = radius * Math.cos(angle -10) - 0.2; // Slightly raise Y to avoid overlap with tree
  
        ornaments.push(
          <Ornament
            key={index}
            position={[x, y, z]}
            color={ornamentColors[index % ornamentColors.length]}
            noteName={notes[index].name || "Anonymous"}
          />
        );
        index++;
      }
    }
  
    return (
      <>
        
        {ornaments}
        {/* Tree Cone */}
        <mesh position={[0, -0, 0]} renderOrder={0}>
          <coneGeometry args={[1.2, rowCount * 1.2, 32]} />
          <meshStandardMaterial 
  color="#1B8A36"
  roughness={0.8}
  metalness={0.1}
  bumpScale={0.02}
  normalScale={[0.1, 0.1]}
  onBeforeCompile={(shader) => {
    // Ensure 'vUv' exists in the shader
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
      varying vec2 vUv;
      void main() {
        vUv = uv;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
      varying vec2 vUv;
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      void main() {
        vec2 normalizedPosition = vec2(vUv.x, vUv.y);
        float noise = random(normalizedPosition) * 0.15;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      'vec4 diffuseColor = vec4( diffuse * (1.0 - noise), opacity );'
    );
  }}
/>

        </mesh>
      </>
    );
  };
  

const ChristmasTree = ({ notes }) => {
  return (
    <>
    <Star />
    <Canvas style={{ height: "100vh" }}>
        
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <Tree notes={notes} />
      <OrbitControls enableZoom={false} />
    </Canvas>
    </>
  );
};

export default ChristmasTree;
