const Text = require('./Text.js');
const ColorManager = require('../manager/color-manager.js');
const FontManager = require('../manager/font-manager.js');
const PositionManager = require('../manager/position-manager.js');

module.exports = class CompetenceText extends Text {
  constructor({ text, positionY, areaColor }) {
    super({
      text,
      positionX: PositionManager.competenceHorizontalStart,
      positionY,
      fontSize: FontManager.competenceHeight,
      font: FontManager.competenceFont,
      fontColor: ColorManager.findLighterShadeRGBColor(areaColor),
    });
  }
};
