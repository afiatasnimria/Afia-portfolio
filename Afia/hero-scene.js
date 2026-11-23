const container = document.getElementById('heroCanvas');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const saveData = navigator.connection?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches;
const scheme = matchMedia('(prefers-color-scheme: light)');

if (container && !reduceMotion && finePointer && !saveData) {
  init().catch(() => {});
}

async function init() {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ antialias: innerWidth >= 700, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5.8;

  const uniforms = {
    uTime: { value: 0 },
    uLight: { value: scheme.matches ? 1 : 0 }
  };
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 1),
    new THREE.ShaderMaterial({
      uniforms,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal; varying vec3 vView;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec3 p = position * (1.0 + 0.04 * sin(uTime * 0.8 + position.y * 2.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`
      , fragmentShader: `
        uniform float uLight;
        varying vec3 vNormal; varying vec3 vView;
        void main(){
          float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
          vec3 col = mix(vec3(0.77,1.0,0.24), vec3(0.55,0.5,0.9), clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0) * 0.4);
          col += fres * 0.45;
          col *= mix(1.0, 0.7, uLight);
          gl_FragColor = vec4(col, 0.42);
        }`
    })
  );
  scene.add(core);

  const resize = () => {
    const w = container.clientWidth || innerWidth;
    const h = container.clientHeight || innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  resize();

  const mouse = { x: 0, y: 0 };
  const onPointer = (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -((event.clientY / innerHeight) * 2 - 1);
  };
  addEventListener('pointermove', onPointer, { passive: true });

  const onScheme = (event) => { uniforms.uLight.value = event.matches ? 1 : 0; };
  scheme.addEventListener('change', onScheme);

  const onResize = () => resize();
  addEventListener('resize', onResize, { passive: true });

  const canvas = renderer.domElement;
  const onContextLost = (event) => {
    event.preventDefault();
    document.body.classList.remove('webgl-ready');
    stop();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
  io.observe(container);

  let raf = 0;
  let stopped = false;
  const clock = new THREE.Clock();
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    uniforms.uTime.value = clock.getElapsedTime();
    core.rotation.y += (mouse.x * 0.3 - core.rotation.y) * 0.05;
    core.rotation.x += (mouse.y * 0.2 - core.rotation.x) * 0.05;
    renderer.render(scene, camera);
  };
  frame();
  document.body.classList.add('webgl-ready');

  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    removeEventListener('pointermove', onPointer);
    removeEventListener('resize', onResize);
    scheme.removeEventListener('change', onScheme);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    core.geometry.dispose();
    core.material.dispose();
    renderer.dispose();
    canvas.remove();
  }
  addEventListener('pagehide', stop, { once: true });
}
