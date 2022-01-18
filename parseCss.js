import { readFile, writeFile } from 'fs';
import { hexToRgb, rgbToHex } from './cssColorConversion.js';

let newContent;

/**
 * Analyze lines in file.
 * @param {string[]} lines Lines in file.
 * @param {string} option 'rgbtohex' or 'hextorgb' or 'auto'.
 */
const analyzeLines = (lines, option) => {
  newContent = '';

  for (let i = 0; i < lines.length; i += 1) {
    let newLine = lines[i];
    if (lines[i].includes('color')) {
      // get css color value, remove semicolon, and trim white spaces
      const color = lines[i].split(':')[1].replace(';', '').trim();

      const colorStyleIsRgb = color.includes('rgb');
      if (((option === 'rgbtohex') || (option === 'auto')) && colorStyleIsRgb) {
        // rgb(255,255,255) -> 255,255,255 -> ['255','255','255'] -> [255,255,255]
        const rgb = color.substring(4, color.length - 1).split(',').map((item) => parseInt(item, 10));
        newLine = newLine.replace(color, rgbToHex(...rgb));
      }

      const colorStyleIsHex = color.startsWith('#') && ((color.length === 7) || (color.length === 4));
      if (((option === 'hextorgb') || (option === 'auto')) && colorStyleIsHex) {
        const rgb = hexToRgb(color);
        newLine = newLine.replace(color, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      }
    }

    newContent += `${newLine}\n`;
  }
};

/**
 * Handle reading and writing css file.
 * @param {object} error Error.
 * @param {string} content Content of css file.
 * @param {string} option 'rgbtohex' or 'hextorgb' or 'auto'.
 */
const handleFileRead = (error, content, option) => {
  // Catch reading error if any
  if (error) {
    console.log('reading error', error);
  }

  analyzeLines(content.split('\n'), option);

  // Write processed content back to the file, replacing old content
  writeFile('styles.css', newContent, (writeErr) => {
    // Catch writing error if any
    if (writeErr) {
      console.log('error writing', newContent, writeErr);
      return;
    }
    console.log('success!');
  });
};

/**
 * Handle file read for rgb-to-hex conversion.
 * @param {object} error Error.
 * @param {string} content Content of css file.
 */
const handleRgbToHexFileRead = (error, content) => {
  handleFileRead(error, content, 'rgbtohex');
};

/**
 * Handle file read for hex-to-rgb conversion.
 * @param {object} error Error.
 * @param {string} content Content of css file.
 */
const handleHexToRgbFileRead = (error, content) => {
  handleFileRead(error, content, 'hextorgb');
};

/**
 * Handle file read for rgb/hex conversion.
 * @param {object} error Error.
 * @param {string} content Content of css file.
 */
const handleAutoFormatFileRead = (error, content) => {
  handleFileRead(error, content, 'auto');
};

/**
 * Read css file.
 * @param {string} option 'rgbtohex' or 'hextorgb' or 'auto'.
 * @param {string} fileName Name of css file.
 */
export default function readCss(option, fileName) {
  if (option === 'rgbtohex') readFile(fileName, 'utf8', handleRgbToHexFileRead);
  else if (option === 'hextorgb') readFile(fileName, 'utf8', handleHexToRgbFileRead);
  else readFile(fileName, 'utf8', handleAutoFormatFileRead);
}
