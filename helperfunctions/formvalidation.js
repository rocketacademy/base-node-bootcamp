/**
 *
 * @param {string} str1 is email is-valid/is-invalid
 * @param {string} str2 is password is-valid/is-invalid
 * @param {string} str3 feedback when invalid password
 * @param {string} str4 feedback when invalid emails
 * @returns
 */
export const validateForm = (str1, str2, str3, str4) => {
  const object = {
    emailvalid: str1,
    pwvalid: str2,
    pwfeedback: str3,
    emailfeedback: str4,
  };
  return object;
};

/**
 *
 * @param {number} length length of the array that you want to create
 * @returns array
 */
export const createEmpty = (array) => {
  const newArray = [];
  for (let i = 0; i < array.length; i += 1) {
    newArray.push('');
  }
  return newArray;
};
