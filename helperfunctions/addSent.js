const addSentProperty = (array, str) => {
  array.forEach((element) => {
    element.sent = str;
  });
  return array;
};

export default addSentProperty;
