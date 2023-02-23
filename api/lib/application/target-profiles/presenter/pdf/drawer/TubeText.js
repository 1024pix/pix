const Text = require('./Text.js');
const ColorManager = require('../manager/color-manager.js');
const FontManager = require('../manager/font-manager.js');
const PositionManager = require('../manager/position-manager.js');

module.exports = class TubeText extends Text {
  constructor({ practicalTitle, practicalDescription, positionY }) {
    super({
      text: practicalTitle || 'error on practicalTitle',
      positionX: PositionManager.tubeFirstPartStart,
      positionY,
      fontSize: FontManager.tubeTitleHeight,
      font: FontManager.tubeTitleFont,
      fontColor: ColorManager.findRGBColor('black'),
      maxWidth: PositionManager.tubeFirstPartWidth,
    });
    this.text2 = practicalDescription || 'error on practicalDescription';
  }

  draw(page, dryRun) {
    if (!dryRun) {
      super.draw(page, dryRun);
      page.drawText(this.text2, {
        x: PositionManager.tubeSecondPartStart,
        y: this.position.y,
        size: FontManager.tubeDescriptionHeight,
        font: FontManager.tubeDescriptionFont,
        color: this.fontColor,
        maxWidth: PositionManager.tubeSecondPartWidth,
        lineHeight: this.font.heightAtSize(this.fontSize),
      });
    }
    const nextPositionYText = this.nextPositionY(page, PositionManager.tubeFirstPartWidth);
    const nextPositionYText2 = this.nextPositionY(page, PositionManager.tubeSecondPartWidth, this.text2);
    return Math.min(nextPositionYText, nextPositionYText2);
  }

  get spaceUnderText() {
    return Math.max(FontManager.tubeTitleFontHeight, FontManager.tubeDescriptionFontHeight) / 2;
  }
};
