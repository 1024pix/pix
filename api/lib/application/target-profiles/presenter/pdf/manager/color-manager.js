import { rgb } from 'pdf-lib';

const colorToRgb = {
  jaffa: rgb(0.949, 0.274, 0.27),
  emerald: rgb(0.102, 0.549, 0.537),
  cerulean: rgb(0.239, 0.407, 1),
  'wild-strawberry': rgb(0.674, 0, 0.552),
  'butterfly-bush': rgb(0.368, 0.145, 0.388),
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
};

const lighterColorToRgb = {
  jaffa: rgb(0.945, 0.631, 0.255),
  emerald: rgb(0.321, 0.851, 0.529),
  cerulean: rgb(0.07, 0.639, 1),
  'wild-strawberry': rgb(1, 0.247, 0.58),
  'butterfly-bush': rgb(0.337, 0.302, 0.651),
};

const DEFAULT_COLOR = 'jaffa';
const DEFAULT_BACKGROUND = rgb(0.93, 0.93, 0.93);

const findRGBColor = function (color = DEFAULT_COLOR) {
  let rgbColor = colorToRgb[color];
  if (!rgbColor) {
    rgbColor = colorToRgb[DEFAULT_COLOR];
  }
  return rgbColor;
};

const findLighterShadeRGBColor = function (color = DEFAULT_COLOR) {
  let rgbColor = lighterColorToRgb[color];
  if (!rgbColor) {
    rgbColor = lighterColorToRgb[DEFAULT_COLOR];
  }
  return rgbColor;
};

const legalMentionColor = colorToRgb['black'];
const coverPageTitleColor = colorToRgb['white'];
const coverPageLegalMentionColor = colorToRgb['white'];

const coverPageVersionColor = colorToRgb['white'];

const competenceBackground = DEFAULT_BACKGROUND;

const thematicBackground = DEFAULT_BACKGROUND;

const tubeBackground = rgb(0.89, 0.89, 0.89);

export {
  findRGBColor,
  findLighterShadeRGBColor,
  legalMentionColor,
  coverPageTitleColor,
  coverPageLegalMentionColor,
  coverPageVersionColor,
  competenceBackground,
  thematicBackground,
  tubeBackground,
};
