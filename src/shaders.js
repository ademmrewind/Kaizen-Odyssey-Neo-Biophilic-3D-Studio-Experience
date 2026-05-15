// ═══════════════════════════════════════════════════════════════
// KAIZEN ODYSSEY — GLSL Shaders
// Liquid Glass & Fluid Distortion for the Ascending Helix
// ═══════════════════════════════════════════════════════════════

export const vertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uScrollVelocity;
  
  varying vec2 vUv;
  varying float vDistortion;
  varying float vDepth;

  // 2D Simplex Noise (Ashima Arts)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    
    // Gentle vertex displacement — "breathing" tiles
    float noiseVal = snoise(vec2(
      position.x * 0.15 + uTime * 0.08,
      position.z * 0.15 + uTime * 0.06
    ));
    
    // Subtle organic wave displacement
    vec3 pos = position;
    float breathe = noiseVal * 0.12 * (1.0 + abs(uScrollVelocity) * 0.3);
    pos += normal * breathe;
    
    vDistortion = noiseVal;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform float uOpacity;
  uniform vec3 uTintColor;

  varying vec2 vUv;
  varying float vDistortion;
  varying float vDepth;

  // 2D Simplex Noise (repeated for fragment)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // ─── Fluid Distortion (water-refraction / silk-wave) ───
    float noiseFreq = 1.8;
    float noiseAmp = 0.018; // Very subtle distortion
    float timeScale = 0.12;  // Very slow movement
    
    vec2 distortedUv = vUv;
    float n1 = snoise(vec2(vUv.x * noiseFreq + uTime * timeScale, 
                           vUv.y * noiseFreq - uTime * timeScale * 0.7));
    float n2 = snoise(vec2(vUv.y * noiseFreq * 1.3 - uTime * timeScale * 0.5, 
                           vUv.x * noiseFreq * 1.3 + uTime * timeScale * 0.8));
    
    distortedUv.x += n1 * noiseAmp;
    distortedUv.y += n2 * noiseAmp;
    
    // Clamp to prevent edge artifacts
    distortedUv = clamp(distortedUv, 0.01, 0.99);
    
    // ─── Base Color Sample ───
    vec4 texColor = texture2D(uTexture, distortedUv);
    
    // Apply warm tint blend
    vec3 tinted = mix(texColor.rgb, uTintColor, 0.15);
    
    // ─── Liquid Edge Dissolution ───
    // Smooth dissolve at edges based on scroll velocity
    float scrollEffect = min(abs(uScrollVelocity) * 0.6, 1.0);
    
    // Edge distance (for all four edges)
    float edgeX = smoothstep(0.0, 0.08 + scrollEffect * 0.12, vUv.x) * 
                  smoothstep(1.0, 0.92 - scrollEffect * 0.12, vUv.x);
    float edgeY = smoothstep(0.0, 0.08 + scrollEffect * 0.12, vUv.y) * 
                  smoothstep(1.0, 0.92 - scrollEffect * 0.12, vUv.y);
    float edgeMask = edgeX * edgeY;
    
    // Noise-based dissolution for organic ink-in-water feel
    float dissNoise = snoise(vec2(
      vUv.x * 4.0 + uTime * 0.05,
      vUv.y * 4.0 - uTime * 0.03
    ));
    edgeMask *= smoothstep(-0.2, 0.3, dissNoise + edgeMask * 0.5);
    
    // ─── Warm Soft Vignette ───
    vec2 vigUv = vUv - 0.5;
    float vignette = 1.0 - dot(vigUv, vigUv) * 1.2;
    vignette = smoothstep(0.0, 0.7, vignette);
    
    // Warm vignette color (earthy amber at edges)
    vec3 vignetteColor = mix(vec3(0.08, 0.07, 0.06), tinted, vignette);
    
    // ─── Depth Fog ───
    float fogFactor = smoothstep(25.0, 8.0, vDepth);
    
    // ─── Final Composite ───
    float finalAlpha = edgeMask * vignette * uOpacity * fogFactor;
    vec3 finalColor = vignetteColor;
    
    // Slight luminosity boost for close tiles
    finalColor += vec3(0.02) * (1.0 - fogFactor * 0.5);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
