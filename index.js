import { readFile } from 'fs';

const fileName = process.argv[2];

let occurences = {};

const handleFileRead = (error, content) => {
  if (error) {
    console.log('error:', error);
  }

  const separateIntoLines = content.split('\n');

  for (let i = 0; i < separateIntoLines.length; i += 1) {
    if (separateIntoLines[i].indexOf('#') !== -1) {
      // get index for start of color code
      const startOfColor = separateIntoLines[i].indexOf('#');
      // get index for end of color code, w/o ;
      const endOfColor = separateIntoLines[i].length - 1;
      const color = separateIntoLines[i].slice(startOfColor, endOfColor);
      // check if color exists in object, and adds to color if it does
      if (color in occurences) {
        occurences[color] += 1;
      } else {
        occurences[color] = 1;
      }
    }
  }
  // iterate over the occurences object and logs the key/values
  for (let [key, value] of Object.entries(occurences)) {
    console.log(`${key}: ${value}`);
  }
};

readFile(fileName, 'utf8', handleFileRead);
