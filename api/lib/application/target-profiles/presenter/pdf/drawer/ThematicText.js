const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const PositionManager = require('../manager/position-manager');

const MAGIC_NUMBER = 5;

class ThematicText extends Text {
  constructor({ text, positionY, positionYAfterTubes }) {
    const positionYOfThematic = positionY - _computeMarginTopThematic(text, positionY, positionYAfterTubes);
    super({
      text,
      positionX: PositionManager.thematicStart,
      positionY: positionYOfThematic,
      fontSize: FontManager.thematicHeight,
      font: FontManager.thematicFont,
      fontColor: ColorManager.findRGBColorByAreaColor('black'),
      maxWidth: PositionManager.thematicWidth,
    });
  }

  draw(page, dryRun = false) {
    super.draw(page, dryRun);
    return this.position.y - _thematicHeight(this.text) - this.spaceUnderText - FontManager.thematicFontHeight;
  }

  get spaceUnderText() {
    return 0;
  }
}

/**
 * @param text{string}
 * @param positionY{number}
 * @param positionYAfterTubes{number}
 * @returns {number}
 */
function _computeMarginTopThematic(text, positionY, positionYAfterTubes) {
  const thematicHeight = _thematicHeight(text);
  if (thematicHeight > positionY - positionYAfterTubes) {
    return 0;
  }
  return (positionY - positionYAfterTubes - FontManager.thematicFontHeight - thematicHeight) / 2;
}
/**
 * @param text{string}
 * @returns {number}
 */
function _thematicHeight(text) {
  const numberOfLine = Text.numberOfLines(
    text,
    FontManager.thematicFont,
    FontManager.thematicHeight,
    null,
    PositionManager.thematicWidth
  );
  return FontManager.thematicFontHeight * numberOfLine;
}

module.exports = ThematicText;
