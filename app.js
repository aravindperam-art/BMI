const form = document.querySelector("#bmi-form");
const weightInput = document.querySelector("#weight");
const weightUnitInput = document.querySelector("#weight-unit");
const genderInput = document.querySelector("#gender");
const heightUnitInput = document.querySelector("#height-unit");
const heightValueInput = document.querySelector("#height-value");
const singleHeightField = document.querySelector("#single-height-field");
const singleHeightLabel = document.querySelector("#single-height-label");
const feetInchesFields = document.querySelector("#feet-inches-fields");
const feetInput = document.querySelector("#feet");
const inchesInput = document.querySelector("#inches");
const person = document.querySelector("#person");
const scoreChip = document.querySelector("#score-chip");

const bmiValue = document.querySelector("#bmi-value");
const categoryValue = document.querySelector("#category-value");
const genderValue = document.querySelector("#gender-value");
const kgValue = document.querySelector("#kg-value");
const gramsValue = document.querySelector("#grams-value");
const poundsValue = document.querySelector("#pounds-value");
const metersValue = document.querySelector("#meters-value");
const visualLabel = document.querySelector("#visual-label");
const visualMessage = document.querySelector("#visual-message");
const cameraVideo = document.querySelector("#camera-video");
const cameraCanvas = document.querySelector("#camera-canvas");
const cameraStatus = document.querySelector("#camera-status");
const cameraPreview = document.querySelector(".camera-preview");
const facePhoto = document.querySelector("#face-photo");
const startCameraButton = document.querySelector("#start-camera");
const takePhotoButton = document.querySelector("#take-photo");
const clearPhotoButton = document.querySelector("#clear-photo");

const categories = {
  underweight: {
    label: "Underweight",
    visual: "Slim build",
    message: "The animated body becomes slimmer because the BMI is below the healthy range.",
    className: "person-underweight",
  },
  normal: {
    label: "Normal weight",
    visual: "Balanced build",
    message: "The animated body stays balanced because the BMI is inside the healthy range.",
    className: "person-normal",
  },
  overweight: {
    label: "Overweight",
    visual: "Broader build",
    message: "The animated body becomes broader because the BMI is above the healthy range.",
    className: "person-overweight",
  },
  obese: {
    label: "Obese",
    visual: "Heavy build",
    message: "The animated body becomes heavier because the BMI is in the obese range.",
    className: "person-obese",
  },
};

let previousHeightUnit = heightUnitInput.value;
let cameraStream = null;
let hasCapturedPhoto = false;

function convertWeightToKg(weight, unit) {
  if (unit === "g") {
    return weight / 1000;
  }

  if (unit === "lb") {
    return weight * 0.45359237;
  }

  return weight;
}

function convertFeetAndInchesToMeters(feet, inches) {
  return (feet * 12 + inches) * 0.0254;
}

function convertHeightToMeters(heightUnit = heightUnitInput.value) {
  if (heightUnit === "m") {
    return readPositiveNumber(heightValueInput);
  }

  if (heightUnit === "ft") {
    const feet = readPositiveNumber(heightValueInput);

    return feet === null ? null : feet * 0.3048;
  }

  if (heightUnit === "in") {
    const inches = readPositiveNumber(heightValueInput);

    return inches === null ? null : inches * 0.0254;
  }

  const feet = readNonNegativeNumber(feetInput);
  const inches = readNonNegativeNumber(inchesInput);

  if (feet === null || inches === null || feet + inches === 0) {
    return null;
  }

  return convertFeetAndInchesToMeters(feet, inches);
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "underweight";
  }

  if (bmi < 25) {
    return "normal";
  }

  if (bmi < 30) {
    return "overweight";
  }

  return "obese";
}

function getGenderLabel(gender) {
  if (gender === "male") {
    return "Male";
  }

  return "Female";
}

function readPositiveNumber(input) {
  const number = Number(input.value);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function readNonNegativeNumber(input) {
  const number = Number(input.value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

function updatePerson(categoryKey) {
  const category = categories[categoryKey];
  const genderClass = genderInput.value === "female" ? "person-female" : "person-male";
  const photoClass = hasCapturedPhoto ? "person-has-photo" : "";

  person.className = `person ${category.className} ${genderClass} ${photoClass}`.trim();
  visualLabel.textContent = category.visual;
  visualMessage.textContent = category.message;
}

function setCameraStatus(message) {
  cameraStatus.textContent = message;
}

function stopCamera() {
  if (cameraStream !== null) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }

  cameraStream = null;
  cameraVideo.srcObject = null;
  cameraPreview.classList.remove("is-active");
  startCameraButton.disabled = false;
  takePhotoButton.disabled = true;
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCameraStatus("Camera access is not available in this browser.");
    return;
  }

  try {
    stopCamera();
    setCameraStatus("Opening camera...");
    startCameraButton.disabled = true;

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 640 },
      },
      audio: false,
    });

    cameraVideo.srcObject = cameraStream;
    cameraPreview.classList.add("is-active");
    takePhotoButton.disabled = false;
    setCameraStatus("Camera ready.");
  } catch (error) {
    stopCamera();
    setCameraStatus("Camera permission was blocked or no camera was found.");
  }
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

function quantizeSoft(value) {
  return Math.round(value / 24) * 24;
}

function softenPortrait(context, width, height) {
  const source = context.getImageData(0, 0, width, height);
  const sourcePixels = source.data;
  const painted = context.createImageData(width, height);
  const paintedPixels = painted.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;

      for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
          const sampleX = Math.max(0, Math.min(width - 1, x + offsetX));
          const sampleY = Math.max(0, Math.min(height - 1, y + offsetY));
          const sampleIndex = (sampleY * width + sampleX) * 4;

          red += sourcePixels[sampleIndex];
          green += sourcePixels[sampleIndex + 1];
          blue += sourcePixels[sampleIndex + 2];
          count += 1;
        }
      }

      const index = (y * width + x) * 4;
      const averageRed = red / count;
      const averageGreen = green / count;
      const averageBlue = blue / count;
      const warmth = y < height * 0.75 ? 18 : 8;

      paintedPixels[index] = clampColor(quantizeSoft(averageRed * 1.1 + 20));
      paintedPixels[index + 1] = clampColor(quantizeSoft(averageGreen * 1.04 + warmth));
      paintedPixels[index + 2] = clampColor(quantizeSoft(averageBlue * 0.86 + 8));
      paintedPixels[index + 3] = 255;
    }
  }

  context.putImageData(painted, 0, 0);
}

function addSoftInkEdges(context, width, height) {
  const image = context.getImageData(0, 0, width, height);
  const pixels = image.data;
  const luminance = new Uint8ClampedArray(width * height);

  for (let index = 0; index < pixels.length; index += 4) {
    luminance[index / 4] = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixelIndex = y * width + x;
      const edge =
        Math.abs(luminance[pixelIndex - 1] - luminance[pixelIndex + 1]) +
        Math.abs(luminance[pixelIndex - width] - luminance[pixelIndex + width]);

      if (edge > 34) {
        const index = pixelIndex * 4;
        pixels[index] = pixels[index] * 0.66;
        pixels[index + 1] = pixels[index + 1] * 0.61;
        pixels[index + 2] = pixels[index + 2] * 0.56;
      }
    }
  }

  context.putImageData(image, 0, 0);
}

function drawEllipse(context, x, y, radiusX, radiusY, fillStyle) {
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fillStyle = fillStyle;
  context.fill();
}

function drawGhibliEye(context, x, y, width, height) {
  context.save();
  context.translate(x, y);
  context.fillStyle = "rgba(255, 248, 232, 0.95)";
  context.strokeStyle = "rgba(47, 36, 31, 0.86)";
  context.lineWidth = width * 0.08;
  context.beginPath();
  context.ellipse(0, 0, width * 0.5, height * 0.5, -0.04, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  const iris = context.createRadialGradient(-width * 0.08, -height * 0.1, 1, 0, 0, width * 0.36);
  iris.addColorStop(0, "#6f5846");
  iris.addColorStop(0.62, "#2f241f");
  iris.addColorStop(1, "#17110f");
  context.fillStyle = iris;
  context.beginPath();
  context.ellipse(0, height * 0.04, width * 0.26, height * 0.34, 0, 0, Math.PI * 2);
  context.fill();

  drawEllipse(context, -width * 0.1, -height * 0.15, width * 0.1, height * 0.12, "rgba(255, 255, 255, 0.95)");
  drawEllipse(context, width * 0.08, height * 0.07, width * 0.045, height * 0.055, "rgba(255, 255, 255, 0.72)");
  context.restore();
}

function drawGhibliFeatures(context, width, height) {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  const faceGlow = context.createRadialGradient(width * 0.5, height * 0.54, 8, width * 0.5, height * 0.56, width * 0.36);
  faceGlow.addColorStop(0, "rgba(255, 224, 190, 0.18)");
  faceGlow.addColorStop(1, "rgba(255, 224, 190, 0)");
  context.fillStyle = faceGlow;
  context.fillRect(0, 0, width, height);

  drawEllipse(context, width * 0.33, height * 0.66, width * 0.085, height * 0.047, "rgba(246, 133, 123, 0.34)");
  drawEllipse(context, width * 0.67, height * 0.66, width * 0.085, height * 0.047, "rgba(246, 133, 123, 0.34)");

  context.strokeStyle = "rgba(54, 40, 34, 0.58)";
  context.lineWidth = width * 0.018;
  context.beginPath();
  context.moveTo(width * 0.31, height * 0.48);
  context.quadraticCurveTo(width * 0.39, height * 0.43, width * 0.47, height * 0.48);
  context.moveTo(width * 0.53, height * 0.48);
  context.quadraticCurveTo(width * 0.61, height * 0.43, width * 0.69, height * 0.48);
  context.stroke();

  drawGhibliEye(context, width * 0.4, height * 0.56, width * 0.145, height * 0.18);
  drawGhibliEye(context, width * 0.6, height * 0.56, width * 0.145, height * 0.18);

  context.strokeStyle = "rgba(118, 75, 60, 0.42)";
  context.lineWidth = width * 0.018;
  context.beginPath();
  context.moveTo(width * 0.505, height * 0.59);
  context.quadraticCurveTo(width * 0.485, height * 0.645, width * 0.525, height * 0.67);
  context.stroke();

  context.strokeStyle = "rgba(125, 54, 58, 0.78)";
  context.lineWidth = width * 0.023;
  context.beginPath();
  context.moveTo(width * 0.42, height * 0.75);
  context.quadraticCurveTo(width * 0.5, height * 0.805, width * 0.58, height * 0.75);
  context.stroke();

  context.strokeStyle = "rgba(255, 255, 246, 0.34)";
  context.lineWidth = width * 0.024;
  context.beginPath();
  context.moveTo(width * 0.28, height * 0.3);
  context.quadraticCurveTo(width * 0.2, height * 0.52, width * 0.27, height * 0.72);
  context.stroke();

  context.restore();
}

function stylizeGhibliPortrait(context, width, height) {
  softenPortrait(context, width, height);
  addSoftInkEdges(context, width, height);

  context.globalCompositeOperation = "soft-light";
  context.fillStyle = "rgba(255, 226, 176, 0.42)";
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "source-over";

  const glow = context.createRadialGradient(width * 0.42, height * 0.35, 10, width * 0.5, height * 0.5, width * 0.58);
  glow.addColorStop(0, "rgba(255, 255, 238, 0.22)");
  glow.addColorStop(1, "rgba(255, 255, 238, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  drawGhibliFeatures(context, width, height);
}

function capturePhoto() {
  if (cameraStream === null || cameraVideo.videoWidth === 0 || cameraVideo.videoHeight === 0) {
    setCameraStatus("Start the camera before taking a photo.");
    return;
  }

  const size = Math.min(cameraVideo.videoWidth, cameraVideo.videoHeight);
  const sourceX = (cameraVideo.videoWidth - size) / 2;
  const sourceY = (cameraVideo.videoHeight - size) / 2;
  const context = cameraCanvas.getContext("2d");

  context.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
  context.drawImage(
    cameraVideo,
    sourceX,
    sourceY,
    size,
    size,
    0,
    0,
    cameraCanvas.width,
    cameraCanvas.height
  );
  stylizeGhibliPortrait(context, cameraCanvas.width, cameraCanvas.height);

  facePhoto.src = cameraCanvas.toDataURL("image/png");
  hasCapturedPhoto = true;
  clearPhotoButton.disabled = false;
  person.classList.add("person-has-photo");
  setCameraStatus("Ghibli-style portrait created from your photo.");
  stopCamera();
}

function clearPhoto() {
  facePhoto.removeAttribute("src");
  hasCapturedPhoto = false;
  clearPhotoButton.disabled = true;
  person.classList.remove("person-has-photo");
  setCameraStatus("Use your camera to create a Ghibli-style avatar face.");
}

function updateHeightFields() {
  const heightUnit = heightUnitInput.value;
  const isFeetAndInches = heightUnit === "ft_in";

  singleHeightField.classList.toggle("is-hidden", isFeetAndInches);
  feetInchesFields.classList.toggle("is-hidden", !isFeetAndInches);

  if (heightUnit === "m") {
    singleHeightLabel.textContent = "Height in Meters";
    heightValueInput.step = "0.01";
  }

  if (heightUnit === "ft") {
    singleHeightLabel.textContent = "Height in Feet";
    heightValueInput.step = "0.01";
  }

  if (heightUnit === "in") {
    singleHeightLabel.textContent = "Height in Inches";
    heightValueInput.step = "0.1";
  }
}

function syncHeightFieldsFromMeters(heightMeters) {
  if (heightMeters === null) {
    return;
  }

  if (heightUnitInput.value === "m") {
    heightValueInput.value = heightMeters.toFixed(2);
  }

  if (heightUnitInput.value === "ft") {
    heightValueInput.value = (heightMeters / 0.3048).toFixed(2);
  }

  if (heightUnitInput.value === "in") {
    heightValueInput.value = (heightMeters / 0.0254).toFixed(1);
  }

  if (heightUnitInput.value === "ft_in") {
    const totalInches = heightMeters / 0.0254;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches - feet * 12;

    feetInput.value = feet;
    inchesInput.value = inches.toFixed(1);
  }
}

function updateUi() {
  const weight = readPositiveNumber(weightInput);
  const heightMeters = convertHeightToMeters();

  if (weight === null || heightMeters === null) {
    scoreChip.textContent = "Check input";
    form.classList.add("is-error");
    return;
  }

  form.classList.remove("is-error");

  const weightKg = convertWeightToKg(weight, weightUnitInput.value);
  const bmi = weightKg / (heightMeters * heightMeters);
  const categoryKey = getBmiCategory(bmi);
  const category = categories[categoryKey];

  bmiValue.textContent = bmi.toFixed(2);
  categoryValue.textContent = category.label;
  genderValue.textContent = getGenderLabel(genderInput.value);
  kgValue.textContent = `${weightKg.toFixed(2)} kg`;
  gramsValue.textContent = `${Math.round(weightKg * 1000)} g`;
  poundsValue.textContent = `${(weightKg * 2.20462262).toFixed(2)} lb`;
  metersValue.textContent = `${heightMeters.toFixed(2)} m`;
  scoreChip.textContent = category.label;

  updatePerson(categoryKey);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateUi();
});

[weightInput, weightUnitInput, genderInput, heightValueInput, feetInput, inchesInput].forEach((input) => {
  input.addEventListener("input", updateUi);
});

heightUnitInput.addEventListener("change", () => {
  const currentHeightMeters = convertHeightToMeters(previousHeightUnit);

  updateHeightFields();
  syncHeightFieldsFromMeters(currentHeightMeters);
  previousHeightUnit = heightUnitInput.value;
  updateUi();
});

startCameraButton.addEventListener("click", startCamera);
takePhotoButton.addEventListener("click", capturePhoto);
clearPhotoButton.addEventListener("click", clearPhoto);
window.addEventListener("beforeunload", stopCamera);

updateHeightFields();
updateUi();
