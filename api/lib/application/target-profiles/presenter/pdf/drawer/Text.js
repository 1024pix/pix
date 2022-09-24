const PositionManager = require('../manager/position-manager');

module.exports = class Text {
  constructor({ text, positionX, positionY, fontSize, font, fontColor, maxWidth }) {
    this.text = text;
    this.position = {
      x: positionX,
      y: positionY,
    };
    this.fontSize = fontSize;
    this.font = font;
    this.fontColor = fontColor;
    this.maxWidth = maxWidth || PositionManager.maxWidth;
  }
  DEFAULT_SPACE_UNDER_TEXT = 10;

  /**
   *
   * @param page {PDFPage}
   * @param dryRun {boolean}
   * @returns {number}
   */
  draw(page, dryRun = false) {
    if (!dryRun) {
      page.drawText(this.text, {
        x: this.position.x,
        y: this.position.y,
        size: this.fontSize,
        font: this.font,
        color: this.fontColor,
        maxWidth: this.maxWidth,
        lineHeight: this.font.heightAtSize(this.fontSize),
      });
    }
    return this.position.y - this.font.heightAtSize(this.fontSize) - this.spaceUnderText;
  }

  /**
   *
   * @returns {number}
   */
  get spaceUnderText() {
    return this.DEFAULT_SPACE_UNDER_TEXT;
  }

  /**
   * @param text{string}
   * @param font{PDFFont}
   * @param fontSize{number}
   * @param page{PDFPage}
   * @param overrideMaxWidth{number}
   * @returns {number}
   */
  static numberOfLines(text, font, fontSize, page = null, overrideMaxWidth = null) {
    const maxWidthForText = overrideMaxWidth || page.getWidth();
    const widthInOneLine = font.widthOfTextAtSize(text, fontSize);
    return Math.ceil(widthInOneLine / maxWidthForText);
  }

  /**
   * @param text{string}
   * @param font{PDFFont}
   * @param fontSize{number}
   * @param positionY{number}
   * @param page{PDFPage}
   * @param overrideMaxWidth{number}
   * @returns {number}
   */
  nextPositionY(text, font, fontSize, page, positionY, overrideMaxWidth = null) {
    const numberOfLines = Text.numberOfLines(text, font, fontSize, page, overrideMaxWidth);
    return positionY - (numberOfLines * font.heightAtSize(fontSize) + this.spaceUnderText);
  }
};
