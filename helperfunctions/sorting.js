const dynamicSort = (method, obj) => {
  if (typeof method !== 'undefined') {
    const sortObj = [...obj];
    // sort them in a descending order
    sortObj.sort((a, b) => {
      const nameA = String(a[method]).toUpperCase();
      const nameB = String(b[method]).toUpperCase();

      // if (typeof nameA === 'string') {
      //   nameA = a[method].toUpperCase();
      //   nameB = b[method].toUpperCase();
      // }

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return sortObj;
  }
  return obj;
};

export default dynamicSort;
