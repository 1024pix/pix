const { rgb } = require('pdf-lib');
const colorToRgb = {
  jaffa: rgb(0.949, 0.274, 0.27),
  emerald: rgb(0.102, 0.549, 0.537),
  cerulean: rgb(0.239, 0.407, 1),
  'wild-strawberry': rgb(0.674, 0, 0.552),
  'butterfly-bush': rgb(0.368, 0.145, 0.388),
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
};

const DEFAULT_COLOR = 'jaffa';
const DEFAULT_BACKGROUND = rgb(0.93, 0.93, 0.93);
const DEBUG_COLOR = colorToRgb.cerulean;

module.exports = {
  /**
   * @param areaColor {string}
   * @return {RGB}
   */
  findRGBColorByAreaColor(areaColor = DEFAULT_COLOR) {
    let rgbColor = colorToRgb[areaColor];
    if (!rgbColor) {
      rgbColor = colorToRgb[DEFAULT_COLOR];
    }
    return rgbColor;
  },
  /**
   * @return {RGB}
   */
  get coverPageLegalMentionColor() {
    return colorToRgb['white'];
  },
  /**
   * @return {RGB}
   */
  get coverPageVersionColor() {
    return colorToRgb['white'];
  },
  /**
   * @return {RGB}
   */
  get competenceBackground() {
    return DEFAULT_BACKGROUND;
  },
  /**
   * @return {RGB}
   */
  get thematicBackground() {
    return DEFAULT_BACKGROUND;
  },
  /**
   * @return {RGB}
   */
  get tubeBackground() {
    return rgb(0.89, 0.89, 0.89);
  },
};
