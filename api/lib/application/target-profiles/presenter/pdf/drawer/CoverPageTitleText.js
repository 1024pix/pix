const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const PositionManager = require('../manager/position-manager');

const COVER_PAGE_TITLE_TEXT_Y_POSITION = 400;

module.exports = class CoverPageTitleText extends Text {
  constructor({ title, page }) {
    const text = title;
    const font = FontManager.coverPageTitleFont;
    const fontSize = FontManager.coverPageTitleHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY: COVER_PAGE_TITLE_TEXT_Y_POSITION,
      fontSize,
      font,
      fontColor: ColorManager.coverPageTitleColor,
      maxWidth: PositionManager.coverPageTitleWidth,
    });
  }
};
