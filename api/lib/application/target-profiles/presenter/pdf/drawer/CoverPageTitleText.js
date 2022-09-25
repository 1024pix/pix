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

  draw(page) {
    const textWidth = this.font.widthOfTextAtSize(this.text, this.fontSize);
    if (textWidth <= this.maxWidth) return super.draw(page);
    const textParts = _splitText(this.text, this.font, this.fontSize, this.maxWidth);
    let positionY = this.position.y;
    for (const textPart of textParts) {
      this.text = textPart;
      this.position.x = Text._positionXForHorizontalCentering(this.text, page, this.font, this.fontSize);
      this.position.y = positionY;
      positionY = super.draw(page);
    }
    return positionY;
  }
};

function _splitText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const textParts = [];
  let currentTextPart = [];
  while (words.length > 0) {
    const currentWord = words.shift();
    const reconstitutedText = currentTextPart.join(' ') + ' ' + currentWord;
    const reconstitutedTextWidth = font.widthOfTextAtSize(reconstitutedText, fontSize);
    if (reconstitutedTextWidth > maxWidth) {
      textParts.push(currentTextPart.join(' '));
      currentTextPart = [currentWord];
    } else {
      currentTextPart.push(currentWord);
    }
  }
  textParts.push(currentTextPart.join(' '));
  return textParts;
}
