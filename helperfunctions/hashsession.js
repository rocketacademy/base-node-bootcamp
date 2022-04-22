// remember to include the lib at the top of the file
import jsSha from 'jssha';

// initialize salt as a global constant
const { SALT } = process.env;

/**
 *
 * @param {string} input string to be hashed
 * @returns hashed string with salt
 */
const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSha('SHA-512', 'TEXT', { encoding: 'UTF8' });

  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;

  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);

  const hash = shaObj.getHash('HEX');

  return hash;
};

export default getHash;
