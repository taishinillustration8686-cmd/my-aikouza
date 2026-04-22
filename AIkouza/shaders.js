// ── 5 Interactive WebGL Shaders ──

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const SHADERS = [
  {
    name: 'Plasma',
    frag: `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform float u_t; uniform vec2 u_m;
void main(){
  vec2 uv = v_uv; vec2 m = u_m; float t = u_t * 0.4;
  float c1 = sin(uv.x*7.0+t+m.x*4.0)*cos(uv.y*5.0-t+m.y*2.0);
  float c2 = sin(length((uv-m)*vec2(1.6,1.0))*14.0-t*2.5);
  float c3 = cos((uv.x-uv.y)*4.0+t*1.1);
  float c = (c1+c2+c3)/3.0;
  vec3 col = vec3(
    0.08+0.08*sin(c*3.14+t),
    0.3+0.3*sin(c*3.14+t+2.09),
    0.5+0.5*sin(c*3.14+t+4.19)
  );
  col = pow(col, vec3(1.4));
  o = vec4(col*0.7, 1.0);
}`
  },
  {
    name: 'Aurora',
    frag: `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform float u_t; uniform vec2 u_m;
void main(){
  vec2 uv = v_uv; vec2 m = u_m; float t = u_t*0.25;
  float b1 = sin(uv.x*4.0+t+m.x*2.5)*0.18;
  float b2 = sin(uv.x*7.0-t*1.3+m.x*3.0)*0.10;
  float b3 = sin(uv.x*11.0+t*0.7)*0.06;
  float g1 = exp(-abs(uv.y-0.38-b1-m.y*0.2)*18.0);
  float g2 = exp(-abs(uv.y-0.55-b2-m.y*0.15)*22.0);
  float g3 = exp(-abs(uv.y-0.68-b3)*30.0);
  vec3 c1 = g1*vec3(0.0,1.0,0.55)*1.1;
  vec3 c2 = g2*vec3(0.15,0.45,1.0)*0.9;
  vec3 c3 = g3*vec3(0.6,0.1,1.0)*0.5;
  vec3 col = c1+c2+c3;
  col *= 1.0-uv.y*0.5;
  o = vec4(col, 1.0);
}`
  },
  {
    name: 'Ripple',
    frag: `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform float u_t; uniform vec2 u_m; uniform vec2 u_click; uniform float u_click_t;
void main(){
  vec2 uv = v_uv; vec2 m = u_m;
  float d = length(uv-m);
  float r = sin(d*30.0-u_t*5.0)*exp(-d*3.5)*0.5;
  float cd = length(uv-u_click);
  float cr = sin(cd*25.0-u_click_t*8.0)*exp(-cd*2.0-u_click_t*0.5);
  uv += normalize(uv-m)*r*0.03;
  vec2 g = fract(uv*18.0);
  float lines = smoothstep(0.03,0.0,g.x)+smoothstep(0.03,0.0,g.y)+
                smoothstep(0.97,1.0,g.x)+smoothstep(0.97,1.0,g.y);
  vec3 col = vec3(0.0,0.5,0.9)*lines*0.5;
  col += vec3(0.0,0.8,1.0)*(r*0.3+max(cr,0.0)*0.25);
  col += vec3(0.02,0.0,0.06);
  o = vec4(col, 1.0);
}`
  },
  {
    name: 'Grid',
    frag: `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform float u_t; uniform vec2 u_m; uniform vec2 u_click; uniform float u_click_t;
void main(){
  vec2 uv = v_uv; vec2 m = u_m;
  vec2 toM = uv-m; float dist = length(toM);
  float w = 0.12/(dist*dist+0.08);
  vec2 warped = uv + toM*w*0.04;
  warped += 0.002*vec2(sin(u_t*0.5+uv.y*8.0), cos(u_t*0.4+uv.x*6.0));
  vec2 gr = fract(warped*16.0);
  float lines = smoothstep(0.96,1.0,gr.x)+smoothstep(0.96,1.0,gr.y);
  float dots = smoothstep(0.04,0.0,length(gr-0.5)-0.46);
  vec3 col = vec3(0.05,0.3,0.7)*(lines+dots*0.3);
  float pulse = exp(-abs(dist-fract(u_click_t*0.5))*20.0)*exp(-u_click_t*0.3);
  col += vec3(0.0,1.0,0.7)*pulse*0.8;
  col += vec3(0.0,0.02,0.06);
  o = vec4(col, 1.0);
}`
  },
  {
    name: 'Metaball',
    frag: `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform float u_t; uniform vec2 u_m;
void main(){
  vec2 uv = v_uv; vec2 m = u_m; float t = u_t*0.35;
  float f = 0.0;
  for(int i=0;i<6;i++){
    float fi = float(i);
    vec2 c = vec2(
      0.5+0.38*sin(t*0.7+fi*1.047+m.x*0.5),
      0.5+0.38*cos(t*0.5+fi*1.047+m.y*0.5)
    );
    float d = length(uv-c);
    f += 0.035/(d*d+0.002);
  }
  float md = length(uv-m);
  f += 0.055/(md*md+0.001);
  float blob = smoothstep(0.7,1.1,f);
  float edge = smoothstep(0.65,0.7,f)-smoothstep(0.7,0.75,f);
  vec3 inner = mix(vec3(0.05,0.0,0.12), vec3(0.0,0.6,1.0), blob);
  inner += vec3(0.7,0.15,1.0)*smoothstep(1.0,1.4,f);
  vec3 col = inner + vec3(0.0,1.0,0.8)*edge*1.5;
  o = vec4(col, 1.0);
}`
  }
];

function initShader(gl, name, frag) {
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  return prog;
}

function setupWebGL(canvas) {
  const gl = canvas.getContext('webgl2');
  if (!gl) return null;

  const programs = SHADERS.map(s => ({ name: s.name, prog: initShader(gl, s.name, s.frag) }));
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  let mouse = [0.5, 0.5], click = [0.5, 0.5], clickT = 0, activeIdx = 0, t0 = performance.now();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  });
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    click = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    clickT = 0;
  });

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize); resize();

  function draw() {
    requestAnimationFrame(draw);
    const t = (performance.now() - t0) / 1000;
    clickT += 0.016;
    const { prog } = programs[activeIdx];
    gl.useProgram(prog);
    const pos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const setU = (name, ...v) => {
      const loc = gl.getUniformLocation(prog, name);
      if (!loc) return;
      if (v.length === 1) gl.uniform1f(loc, v[0]);
      else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
    };
    setU('u_t', t);
    setU('u_m', mouse[0], mouse[1]);
    setU('u_click', click[0], click[1]);
    setU('u_click_t', clickT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  draw();

  return {
    setShader: idx => { activeIdx = idx; }
  };
}

window.setupWebGL = setupWebGL;
window.SHADER_NAMES = SHADERS.map(s => s.name);
