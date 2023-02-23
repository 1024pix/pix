const Text = require('./Text.js');
const ColorManager = require('../manager/color-manager.js');
const FontManager = require('../manager/font-manager.js');
const TemplatePageManager = require('../manager/template-page-manager.js');

const MARGIN_TOP_AREA = 5;
const MARGIN_BOTTOM_AREA = 50;

module.exports = class AreaText extends Text {
  /**
   *
   * @param text {string}
   * @param areaColor {string}
   * @param page {PDFPage}
   */
  constructor({ text, areaColor, page }) {
    let positionY;
    const numberOfLine = Text.numberOfLines(text, FontManager.areaFont, FontManager.areaHeight, page);
    if (numberOfLine === 1) {
      positionY = page.getHeight() - FontManager.areaFontHeight - MARGIN_TOP_AREA;
    } else {
      positionY = page.getHeight() - FontManager.areaFontHeight / 2 - MARGIN_TOP_AREA;
    }
    super({
      text,
      positionX: 0,
      positionY,
      fontSize: FontManager.areaHeight,
      font: FontManager.areaFont,
      fontColor: ColorManager.findRGBColor('white'),
      maxWidth: page.getWidth(),
    });
    this.areaColor = areaColor;
    this.positionYAfter = page.getHeight() - MARGIN_BOTTOM_AREA;
  }
  draw(page, dryRun = false) {
    if (!dryRun) {
      page.drawPage(TemplatePageManager.findTemplatePage(this.areaColor));
    }
    super.draw(page);
    return this.positionYAfter;
  }

  drawAlignCenter(page, dryRun = false) {
    if (!dryRun) {
      page.drawPage(TemplatePageManager.findTemplatePage(this.areaColor));
    }
    super.drawAlignCenter(page, dryRun);
    return this.positionYAfter;
  }
};
