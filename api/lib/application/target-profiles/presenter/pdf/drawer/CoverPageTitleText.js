const Text = require('./Text.js');
const ColorManager = require('../manager/color-manager.js');
const FontManager = require('../manager/font-manager.js');
const PositionManager = require('../manager/position-manager.js');

module.exports = class CoverPageTitleText extends Text {
  constructor({ title, page }) {
    const text = title;
    const font = FontManager.coverPageTitleFont;
    const fontSize = FontManager.coverPageTitleHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY: PositionManager.coverPageTitleVerticalStart,
      fontSize,
      font,
      fontColor: ColorManager.coverPageTitleColor,
      maxWidth: PositionManager.coverPageTitleWidth,
    });
  }
};
