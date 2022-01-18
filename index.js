import { writeFile, readFile } from 'fs';
import { convertHexToRGB, convertRGBText } from './conversionFunctions.js';

const file = process.argv[3];
const convertFunction = process.argv[2];

const addConvertedLines = (content) => {
  // convert only HEX to RGB
  // convert file into individual lines
  const lines = content.split('\n');
  // loop through each line and check for hex color code
  console.log(lines);
  let newLine = '';
  if (convertFunction === 'hextorgb') {
    for (let i = 0; i < lines.length; i += 1) {
      // returns false or indexNo of #
      const hexIndexNo = checkHexInLine(lines[i]);
      console.log(lines[i]);
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
  // convert only RGB to HEX
  if (convertFunction === 'rgbtohex') {
    for (let i = 0; i < lines.length; i += 1) {
      const rgbIndexNo = checkRgbInLine(lines[i]);
      if (rgbIndexNo) {
        const rgbNo = lines[i].slice(rgbIndexNo, lines[i].length); // (225, 225, 225)
        const hexText = convertRGBText(rgbNo);
        // console.log(hexText);
        newLine += `background-color: ${hexText}\n`;
      }
      if (!rgbIndexNo) {
        newLine += `${lines[i]}\n`;
      }
    }
  }

  return newLine;
};

// function that reads style.css and alters the file
const handleReadFile = (err, content) => {
  if (err) {
    console.log('read error', err);
  }
  const newContent = addConvertedLines(content);
  // writeFile(file, newContent, (err) => {
  //   if (err) {
  //     console.log('write error', err);
  //   }
  // });
};

const checkHexInLine = (content) => {
  if (content.indexOf('#') !== -1) {
    return content.indexOf('#');
  } else {
    return false;
  }
};

const checkRgbInLine = (content) => {
  if (content.indexOf('(') !== -1) {
    return content.indexOf('(');
  } else {
    return false;
  }
};

readFile(file, 'utf8', handleReadFile);
