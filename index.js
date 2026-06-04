const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function calculateBmi(weightKg, heightMeters) {
  return weightKg / (heightMeters * heightMeters);
}

function convertFeetAndInchesToMeters(feet, inches) {
  const totalInches = feet * 12 + inches;

  return totalInches * 0.0254;
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal weight";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

function parsePositiveNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

function parseNonNegativeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function parseGender(value) {
  const gender = value.trim().toLowerCase();

  if (gender === "male" || gender === "m") {
    return "Male";
  }

  if (gender === "female" || gender === "f") {
    return "Female";
  }

  return null;
}

async function main() {
  console.log("BMI Calculator");
  console.log("--------------");

  const [weightArg, feetArg, inchesArg, genderArg] = process.argv.slice(2);
  const weightInput = weightArg || (await ask("Enter your weight in kilograms: "));
  const feetInput = feetArg || (await ask("Enter your height feet: "));
  const inchesInput = inchesArg || (await ask("Enter your height inches: "));
  const genderInput = genderArg || (await ask("Enter your gender (male/female): "));

  const weightKg = parsePositiveNumber(weightInput);
  const heightFeet = parsePositiveNumber(feetInput);
  const heightInches = parseNonNegativeNumber(inchesInput);
  const gender = parseGender(genderInput);

  if (weightKg === null || heightFeet === null || heightInches === null || gender === null) {
    console.log("Please enter valid positive numbers for weight, feet, and inches, and male or female for gender.");
    rl.close();
    return;
  }

  const heightMeters = convertFeetAndInchesToMeters(heightFeet, heightInches);
  const bmi = calculateBmi(weightKg, heightMeters);
  const category = getBmiCategory(bmi);

  console.log(`\nYour BMI is ${bmi.toFixed(2)}.`);
  console.log(`Gender: ${gender}`);
  console.log(`Category: ${category}`);

  rl.close();
}

main();
