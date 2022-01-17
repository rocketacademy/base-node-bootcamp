import { readCss } from './parseCss.js';

const firstArg = process.argv[2];
const secondArg = process.argv[3];

if ((firstArg === 'rgbtohex') || (firstArg === 'hextorgb')) {
  readCss(firstArg, secondArg);
} else {
  readCss('auto', firstArg);
}
