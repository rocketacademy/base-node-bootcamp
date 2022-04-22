// const sliceIntoChunks = (arr, chunkSize) => {
//   const array = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     const chunk = arr.slice(i, i + chunkSize);
//     chunk.push('pending');
//     array.push(chunk);
//   }
//   console.log(array);
//   return array;
// };

export const sliceIntoChunks = (arr) => {
  const newArray = [];
  const [taskName, taskduedate, taskEmail] = arr;
  // check if the array has multiple entries
  if (typeof taskName === 'string') {
    newArray.push(arr);
    return newArray;
  }

  for (let i = 0; i < taskName.length; i += 1) {
    const array = [taskName[i], taskduedate[i], taskEmail[i]];
    newArray.push(array);
  }
  return newArray;
};

export const sliceForEdit = (arr) => {
  const newArray = [];
  const [taskId, taskName, taskduedate, taskEmail] = arr;
  // check if the array has multiple entries
  if (typeof taskName === 'string') {
    newArray.push(arr);
    return newArray;
  }

  for (let i = 0; i < taskName.length; i += 1) {
    const array = [taskId[i], taskName[i], taskduedate[i], taskEmail[i]];
    newArray.push(array);
  }
  return newArray;
};
