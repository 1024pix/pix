const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const TemplatePageManager = require('../manager/template-page-manager');

const AREA_NAME_FONT_SIZE = 20;
const MARGIN_TOP_AREA = 30;
const MARGIN_BOTTOM_AREA = 30;

module.exports = class AreaText extends Text {
  /**
   *
   * @param text {string}
   * @param areaColor {string}
   * @param page {PDFPage}
   */
  constructor({ text, areaColor, page }) {
    const positionY = page.getSize().height - MARGIN_TOP_AREA;
    const robotoCondensedBoldFont = FontManager.findFontByFontKey(FontManager.key.robotoCondensedBold);
    super({
      text,
      positionX: _positionXToCenterText(text, page, robotoCondensedBoldFont),
      positionY,
      fontSize: AREA_NAME_FONT_SIZE,
      font: robotoCondensedBoldFont,
      fontColor: ColorManager.findRGBColorByAreaColor('white'),
    });
    this.areaColor = areaColor;
  }
  draw(page, dryRun = false) {
    if (!dryRun) {
      page.drawPage(TemplatePageManager.findTemplatePage(this.areaColor));
    }
    return super.draw(page);
  }

  get spaceUnderText() {
    return MARGIN_BOTTOM_AREA;
  }
};

/**
 * @param text{string}
 * @param page{PDFPage}
 * @param font{PDFFont}
 * @returns {number}
 * @private
 */
function _positionXToCenterText(text, page, font) {
  const textWidth = font.widthOfTextAtSize(text, AREA_NAME_FONT_SIZE);
  return page.getWidth() / 2 - textWidth / 2;
}
