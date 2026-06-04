# BMI Calculator

A JavaScript BMI calculator with a command-line version and a browser UI.

The browser UI accepts weight in kilograms, grams, or pounds. Height can be
entered in meters, feet, inches, or feet and inches, then converted to meters
for the BMI formula.

## Browser UI

Open `index.html` in your browser.

## Terminal

```bash
npm start
```

You can also pass the values directly:

```bash
npm start -- 70 5 8
```

## Example

```text
Enter your weight in kilograms: 70
Enter your height feet: 5
Enter your height inches: 8

Your BMI is 23.46.
Category: Normal weight
```

## Formula

```text
BMI = weight in kilograms / (height in meters * height in meters)
```
