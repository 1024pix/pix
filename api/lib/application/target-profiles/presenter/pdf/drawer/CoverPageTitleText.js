const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const PositionManager = require('../manager/position-manager');

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
