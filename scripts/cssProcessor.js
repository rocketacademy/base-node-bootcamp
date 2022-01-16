import { rgbToHex, hexToRgb, parseRGBString } from "./cssConversions.js";
import { readFile, writeFile } from "fs";

// ========================================================
// - Global variables
// ========================================================
let conversionType;
let filename;

// ========================================================
// - Application Logic
// ========================================================
/**
 * Process css content and perform conversion according to conversion type specified
 * @param readErr - Reading error if any
 * @param content - Original file content
 * @returns undefined
 */
const cssFileHandler = (readErr, content) => {
  if (readErr) {
    console.log("read error", readErr);
  }

  const lines = content.split("\n");
  let newContent = "";

  for (let i = 0; i < lines.length; i += 1) {
    if (
      lines[i].includes(":") &&
      (lines[i].includes("#") || lines[i].includes("rgb"))
    ) {
      newContent += convertColor(lines[i], conversionType);
      newContent += "\n";
    } else {
      newContent += lines[i];
      newContent += "\n";
    }
  }

  console.log(newContent);

  writeFile(filename, newContent, (writeErr) => {
    if (writeErr) {
      console.log("write error", newContent, writeErr);
      return;
    }
    console.log("write successful");
  });
};

/**
 * Perform css color conversion of string according to conversion type specified
 * @param s - input string
 * @param type - conversion type string (rgbtohex/ hextorgb)
 * @returns string
 */
const convertColor = (s, type) => {
  // extract color from original string, keep original str if conversion does not apply
  const idx = s.search(":");
  const colorString = s.slice(idx + 1, -1).trim();
  let originalString = s;

  if (type === "rgbtohex" && colorString.startsWith("rgb")) {
    const rgb = parseRGBString(colorString);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    originalString = s.slice(0, idx + 2); // including : and space
    originalString += hex;
    originalString += ";";
  }

  // TODO: bad nested ifs
  if (type === "hextorgb" && colorString.startsWith("#")) {
    const rgb = hexToRgb(colorString);
    if (rgb) {
      originalString = s.slice(0, idx + 2); // including : and space
      originalString += `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      originalString += ";";
    } else {
      console.log(
        `[ERROR] no valid rgb conversion found for hex ${colorString}`
      );
      return;
    }
  }

  return originalString;
};

export const handleCssConversion = (file, type) => {
  conversionType = type;
  filename = file;
  readFile(filename, "utf8", cssFileHandler);
};
