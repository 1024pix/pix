const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');

const COVER_PAGE_VERSION_TEXT_Y_POSITION = 120;

module.exports = class CoverPageVersionText extends Text {
  constructor({ dateString, page }) {
    const text = `Version du ${dateString}`;
    const positionX = _positionXToCenterText(
      text,
      page,
      FontManager.coverPageVersionFont,
      FontManager.coverPageVersionHeight
    );
    super({
      text,
      positionX: positionX,
      positionY: COVER_PAGE_VERSION_TEXT_Y_POSITION,
      fontSize: FontManager.coverPageVersionHeight,
      font: FontManager.coverPageVersionFont,
      fontColor: ColorManager.coverPageVersionColor,
    });
  }
};

/**
 * @param text{string}
 * @param page{PDFPage}
 * @param font{PDFFont}
 * @param fontSize{number}
 * @returns {number}
 * @private
 */
function _positionXToCenterText(text, page, font, fontSize) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  return page.getWidth() / 2 - textWidth / 2;
}
