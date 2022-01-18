// HEX to RGB conversion
export const convertHexToRGB = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// RGB to HEX conversion
export function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}
export function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
// alert(rgbToHex(0, 51, 255)); // #0033ff

// convert rgb to hex
export const convertRGBText = (content) => {
  let numbers = content.slice(1, content.length - 1); // slicing string returns string
  const numberList = numbers.split(','); // returns an array
  const [r, g, b] = toNumber(numberList);
  return rgbToHex(r, g, b);
};

const toNumber = (array) => array.map(Number);
