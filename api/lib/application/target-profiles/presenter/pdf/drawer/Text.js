const PositionManager = require('../manager/position-manager.js');
const pdfLibUtils = require('pdf-lib/cjs/utils');

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
   * @param page {PDFPage}
   * @param dryRun {boolean}
   * @returns {number}
   */
  drawAlignCenter(page, dryRun = false) {
    const textParts = Text.splitLines(this.text, this.font, this.fontSize, page, this.maxWidth);
    let positionY = this.position.y;
    for (const line of textParts) {
      positionY = this._drawLineCenter(page, line, positionY, dryRun);
    }
    return positionY - this.font.heightAtSize(this.fontSize) - this.spaceUnderText;
  }

  /**
   * @param textLine {string}
   * @param page {PDFPage}
   * @param dryRun {boolean}
   * @returns {number}
   * @private
   */
  _drawLineCenter(page, textLine, positionY, dryRun = false) {
    if (!dryRun) {
      page.drawText(textLine, {
        x: Text._positionXForHorizontalCentering(textLine, page, this.font, this.fontSize),
        y: positionY,
        size: this.fontSize,
        font: this.font,
        color: this.fontColor,
        maxWidth: this.maxWidth,
        lineHeight: this.font.heightAtSize(this.fontSize),
      });
    }
    return positionY - this.font.heightAtSize(this.fontSize);
  }

  /**
   *
   * @returns {number}
   */
  get spaceUnderText() {
    return this.font.heightAtSize(this.fontSize) / 2;
  }

  /**
   * @param text{string}
   * @param font{PDFFont}
   * @param fontSize{number}
   * @param page{PDFPage}
   * @param overrideMaxWidth{number}
   * @returns {string[]}
   */
  static splitLines(text, font, fontSize, page = null, overrideMaxWidth = null) {
    const maxWidthForText = overrideMaxWidth || page.getWidth();
    const textWidth = function (t) {
      return font.widthOfTextAtSize(t, fontSize);
    };
    const lines = pdfLibUtils.breakTextIntoLines(text, [' '], maxWidthForText, textWidth);
    return lines;
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
    return Text.splitLines(text, font, fontSize, page, overrideMaxWidth).length;
  }

  /**
   * @param page{PDFPage}
   * @param text{string}
   * @param overrideMaxWidth{number}
   * @returns {number}
   */
  nextPositionY(page, overrideMaxWidth = null, text = null) {
    const numberOfLines = Text.numberOfLines(text || this.text, this.font, this.fontSize, page, overrideMaxWidth);
    return this.position.y - (numberOfLines * this.font.heightAtSize(this.fontSize) + this.spaceUnderText);
  }

  /**
   * @param text{string}
   * @param page{PDFPage}
   * @param font{PDFFont}
   * @param fontSize{number}
   * @returns {number}
   */
  static _positionXForHorizontalCentering(text, page, font, fontSize) {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    return page.getWidth() / 2 - textWidth / 2;
  }
};
