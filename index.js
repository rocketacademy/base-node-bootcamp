import { readFile } from 'fs';

const whenFileIsRead = (error, content) => {
  const colorArray = [];
  const counts = {};
  const lines = content.split('\n');
  // loop through all the lines in the file, if there is a
  // b (the first letter of 'background-color') at index 2,
  // slice the corresponding portion of the string(line) where
  // the color will be and push it into colorArray
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i][2] === 'b') {
      const color = lines[i].slice(20, 27);
      colorArray.push(color);
    }
  }

  // loop through colorArray
  for (let j = 0; j < colorArray.length; j += 1) {
    // if the color does exist in counts(object), add one to the count
    // of the color
    if (counts[colorArray[j]]) {
      counts[colorArray[j]] += 1;
    } else {
      // if color does not yet exist in counts(object), add it to counts
      counts[colorArray[j]] = 1;
    }
  }
  console.log(counts);
};

const filename = 'styles.css';
readFile(filename, 'utf8', whenFileIsRead);
