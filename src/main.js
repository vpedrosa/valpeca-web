import "./style.css";
import { mountShaderAnimation } from "./shader-animation.js";
import { attachTextScramble } from "./text-scramble.js";

const container = document.getElementById("shader");
if (container) {
  mountShaderAnimation(container);
}

const title = document.getElementById("title");
if (title) {
  attachTextScramble(title);
}
