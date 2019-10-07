export default function(hexStart, hexEnd, colorCount) {
  const rgbStart = convertToRGB(hexStart);
  const rgbEnd   = convertToRGB (hexEnd);

  //Alpha blending amount
  let alpha = 0.0;

  const gradientColors = [];

  for (let i = 0; i < colorCount; i++) {
    const c = [];
    alpha += (1.0 / colorCount);

    c[0] = (1 - alpha) * rgbStart[0] + rgbEnd[0] * alpha;
    c[1] = (1 - alpha) * rgbStart[1] + rgbEnd[1] * alpha;
    c[2] = (1 - alpha) * rgbStart[2] + rgbEnd[2] * alpha;

    gradientColors.push(convertToHex(c));
  }

  return gradientColors;
}

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
  const codeHex = hex.substring(1, 7);

  const color = [];
  color[0] = parseInt(codeHex.substring(0, 2), 16);
  color[1] = parseInt(codeHex.substring(2, 4), 16);
  color[2] = parseInt(codeHex.substring(4, 6), 16);

  return color;
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
  return '#' + _hex(rgb[0]) + _hex(rgb[1]) + _hex(rgb[2]);
}

function _hex(c) {
  const s = '0123456789abcdef';
  const i = parseInt(c);

  return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
}
