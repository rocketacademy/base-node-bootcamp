import { writeFile, readFile } from 'fs';
import {
  convertHexToRGB,
  componentToHex,
  rgbToHex,
} from './conversionFunctions.js';

const file = process.argv[3];
const convertFunction = process.argv[2];

const addConvertedLines = (content) => {
  // convert file into individual lines
  const lines = content.split('\n');
  // loop through each line and check for hex color code
  let newLine = '';
  // convert only HEX to RGB
  if (convertFunction === 'hextorgb') {
    for (let i = 0; i < lines.length; i += 1) {
      // returns false or indexNo of #
      const hexIndexNo = checkHexInLine(lines[i]);
      // console.log(hexIndexNo);
      if (hexIndexNo) {
        const hexNo = lines[i].slice(hexIndexNo, lines[i].length - 2);
        const convertToRGB = convertHexToRGB(hexNo);
        const { r, g, b } = convertToRGB;
        newLine += `background-color: rgb(${r}, ${g}, ${b})\n`;
      }
      if (!hexIndexNo) {
        newLine += `${lines[i]}\n`;
      }
    }
  }
  // convert only RGB to HEX DOING
  if (convertFunction === 'rgbtohex') {
  }

  return newLine;
};

const handleReadFile = (err, content) => {
  if (err) {
    console.log('read error', err);
  }
  const newContent = addConvertedLines(content);
  writeFile(file, newContent, (err) => {
    if (err) {
      console.log('write error', err);
    }
  });
};

const checkHexInLine = (content) => {
  if (content.indexOf('#') !== -1) {
    return content.indexOf('#');
  } else {
    return false;
  }
};

readFile(file, 'utf8', handleReadFile);
