// Efecto "text scramble" en JS vanilla, portado del componente de ibelick.
// Revela el texto letra a letra mientras el resto baraja caracteres aleatorios.

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Aplica el efecto scramble a un elemento de texto.
 *
 * Se dispara al inicio y al pasar el ratón por encima, pero como mucho una vez
 * cada `cooldown` ms.
 *
 * @param {HTMLElement} element
 * @param {object} [options]
 * @param {number} [options.duration=0.8]   duración total en segundos
 * @param {number} [options.speed=0.04]     intervalo entre frames en segundos
 * @param {string} [options.characterSet]   caracteres usados para barajar
 * @param {number} [options.cooldown=7000]  tiempo mínimo entre disparos en ms
 * @returns {() => void} función de limpieza
 */
export function attachTextScramble(element, options = {}) {
  const {
    duration = 0.8,
    speed = 0.04,
    characterSet = defaultChars,
    cooldown = 7000,
  } = options;

  const text = element.textContent.trim();
  element.textContent = text;

  let animating = false;
  let lastRun = -Infinity;
  let intervalId = 0;

  const scramble = (now) => {
    if (animating) return;
    if (now - lastRun < cooldown) return;
    lastRun = now;
    animating = true;

    const steps = duration / speed;
    let step = 0;

    intervalId = setInterval(() => {
      let scrambled = "";
      const progress = step / steps;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
        } else if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      element.textContent = scrambled;
      step++;

      if (step > steps) {
        clearInterval(intervalId);
        element.textContent = text;
        animating = false;
      }
    }, speed * 1000);
  };

  const onEnter = () => scramble(performance.now());
  element.addEventListener("mouseenter", onEnter);

  // Disparo inicial. performance.now() arranca cerca de 0, así que el cooldown
  // bloquea un hover inmediato durante los primeros 7 s, como se pide.
  scramble(performance.now());

  return () => {
    clearInterval(intervalId);
    element.removeEventListener("mouseenter", onEnter);
    element.textContent = text;
  };
}
