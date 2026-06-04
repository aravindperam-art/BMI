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

  person.className = `person ${category.className} ${genderClass}`;
  visualLabel.textContent = category.visual;
  visualMessage.textContent = category.message;
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

updateHeightFields();
updateUi();
