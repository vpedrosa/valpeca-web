// Animación de shader en WebGL puro (sin dependencias).
// Un triángulo a pantalla completa + un fragment shader.

const vertexShaderSource = /* glsl */ `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = /* glsl */ `
  #define TWO_PI 6.2831853072
  #define PI 3.14159265359

  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float t = time * 0.05;
    float lineWidth = 0.002;

    vec3 color = vec3(0.0);
    for (int j = 0; j < 3; j++) {
      for (int i = 0; i < 5; i++) {
        color[j] += lineWidth * float(i * i) /
          abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
      }
    }

    gl_FragColor = vec4(color[0], color[1], color[2], 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Error compilando shader: ${log}`);
  }
  return shader;
}

/**
 * Monta la animación de shader dentro del contenedor dado.
 * Devuelve una función de limpieza que para el bucle y libera recursos.
 *
 * @param {HTMLElement} container
 * @returns {() => void}
 */
export function mountShaderAnimation(container) {
  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  container.appendChild(canvas);

  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    throw new Error("WebGL no está disponible en este navegador.");
  }

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Error enlazando programa: ${gl.getProgramInfoLog(program)}`);
  }
  gl.useProgram(program);

  // Triángulo que cubre todo el clip space (-1..1).
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  const timeLocation = gl.getUniformLocation(program, "time");

  let time = 1.0;

  const onResize = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(container.clientWidth * dpr);
    const height = Math.floor(container.clientHeight * dpr);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${container.clientWidth}px`;
    canvas.style.height = `${container.clientHeight}px`;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolutionLocation, width, height);
  };

  onResize();
  window.addEventListener("resize", onResize, false);

  let animationId = 0;
  let running = true;

  const render = () => {
    if (!running) return;
    animationId = requestAnimationFrame(render);
    time += 0.05;
    gl.uniform1f(timeLocation, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Pausa el bucle cuando la pestaña no está visible (ahorra batería/CPU).
  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(animationId);
    } else if (!running) {
      running = true;
      render();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  render();

  return () => {
    running = false;
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);

    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }

    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
  };
}
