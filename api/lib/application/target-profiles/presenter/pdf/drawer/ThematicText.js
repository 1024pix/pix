const Text = require('./Text.js');
const ColorManager = require('../manager/color-manager.js');
const FontManager = require('../manager/font-manager.js');
const PositionManager = require('../manager/position-manager.js');

class ThematicText extends Text {
  constructor({ text, positionY, positionYAfterTubes }) {
    const thematicText = text || 'error on thematic name';
    const positionYOfThematic = positionY - _computeMarginTopThematic(thematicText, positionY, positionYAfterTubes);
    super({
      text: thematicText,
      positionX: PositionManager.thematicHorizontalStart,
      positionY: positionYOfThematic,
      fontSize: FontManager.thematicHeight,
      font: FontManager.thematicFont,
      fontColor: ColorManager.findRGBColor('black'),
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
