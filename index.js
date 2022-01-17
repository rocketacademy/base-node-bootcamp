import { writeFile, readFile } from 'fs';

const convertHexToRGB = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const file = process.argv[2];

const handleReadFile = (err, content) => {
  if (err) {
    console.log('read error', err);
  }
  // convert file into individual lines
  const lines = content.split('\n');
  // loop through each line and check for hex color code
  let newLine = '';
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
      newLine += lines[i];
    }
  }
  console.log(newLine);
};

const checkHexInLine = (content) => {
  if (content.indexOf('#') !== -1) {
    return content.indexOf('#');
  } else {
    return false;
  }
};

readFile(file, 'utf8', handleReadFile);
