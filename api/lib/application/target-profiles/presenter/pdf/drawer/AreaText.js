const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const TemplatePageManager = require('../manager/template-page-manager');

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
    const font = FontManager.areaFont;
    const fontSize = FontManager.areaHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY,
      fontSize,
      font,
      fontColor: ColorManager.findRGBColor('white'),
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
