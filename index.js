// Import readFile function from global fs module. fs stands for file system.
import { readFile } from "fs";

const rgbToHex = (rgb) => {
  let result = /rgb(\((\d+), (\d+), (\d+)\))/.exec(rgb);
  return result
    ? "#" +
        (
          (parseInt(result[2]) << 16) +
          (parseInt(result[3]) << 8) +
          parseInt(result[4])
        ).toString(16)
    : null;
};

// Define callback function to run after retrieving file contents in readFile
const handleFileRead = (error, content) => {
  // foundHex errors if any
  if (error) {
    console.log("read error", error);
    return;
  }

  const regexHex = /#\w+/gm;
  let foundHex = content.match(regexHex);
  const regexRgb = /rgb(\((\d+), (\d+), (\d+)\))/gm;
  let foundRgb = content.match(regexRgb);
  for (let value of foundRgb) {
    foundHex.push(rgbToHex(value));
  }
  const regexStyle = /^\s{2}[A-Za-z\-]+:/gm;
  let foundStyle = content.match(regexStyle);
  for (let i = 0; i < foundStyle.length; i++) {
    foundStyle[i] = foundStyle[i].trim();
  }

  // Create Object as tally
  let colorTally = {};
  let styleTally = {};

  console.log(`-------
colours:
-------`);
  // Loop over foundHex
  for (let i = 0; i < foundHex.length; i += 1) {
    let colorName = foundHex[i];
    // If we have seen the color name before, increment its count
    if (colorName in colorTally) {
      colorTally[colorName] += 1;
    }
    // Else, initialise count of this color name to 1
    else {
      colorTally[colorName] = 1;
    }
  }

  for (let key in colorTally) {
    console.log(`${key}: ${colorTally[key]}`);
  }

  console.log(`-------
styles:
-------`);

  // Loop over foundStyle
  for (let i = 0; i < foundStyle.length; i += 1) {
    let styleName = foundStyle[i];
    // If we have seen the style name before, increment its count
    if (styleName in styleTally) {
      styleTally[styleName] += 1;
    }
    // Else, initialise count of this style name to 1
    else {
      styleTally[styleName] = 1;
    }
  }

  for (let key in styleTally) {
    console.log(`${key} ${styleTally[key]}`);
  }
};

//sample command: node index.js styles.css
readFile(process.argv[2], "utf8", handleFileRead);
