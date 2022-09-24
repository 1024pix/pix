const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const PositionManager = require('../manager/position-manager');

module.exports = class CompetenceText extends Text {
  constructor({ text, positionY, areaColor }) {
    super({
      text,
      positionX: PositionManager.competenceStart,
      positionY,
      fontSize: FontManager.competenceHeight,
      font: FontManager.competenceFont,
      fontColor: ColorManager.findRGBColorByAreaColor(areaColor),
    });
  }
};
