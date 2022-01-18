// ========================================================
// - Color Converter Functions
// ========================================================

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// ========================================================
// - Helper Functions
// ========================================================
export const parseRGBString = (str) => {
  // 'rgb(255,255,255)' - find , to separate rgb values, extract numbers only
  const arr = str.split(","); //[ 'rgb(255', '255', '255)' ]
  let r = arr[0].replace("rgb(", "");
  r = Number(r);
  let g = arr[1];
  g = Number(g);
  let b = arr[2].replace(")", "");
  b = Number(b);
  return { r, g, b };
};
