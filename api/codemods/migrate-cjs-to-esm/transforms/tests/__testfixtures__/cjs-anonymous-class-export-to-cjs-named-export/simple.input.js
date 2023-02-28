module.exports = class CoverPageLegaLMentionText extends Text {
  constructor({ language }) {
    const text = textByLang[language];
    super({
      text,
      positionX: PositionManager.coverPageLegalMentionHorizontalStart,
      positionY: PositionManager.coverPageLegalMentionVerticalStart,
      fontSize: FontManager.coverPageLegalMentionHeight,
      font: FontManager.coverPageLegalMentionFont,
      fontColor: ColorManager.coverPageLegalMentionColor,
      maxWidth: PositionManager.coverPageLegalMentionWidth,
    });
  }
};
