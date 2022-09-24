const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');

const COVER_PAGE_LEGAL_MENTION_TEXT_Y_POSITION = 45;
const COVER_PAGE_LEGAL_MENTION_TEXT_X_POSITION = 40;
const COVER_PAGE_LEGAL_MENTION_TEXT_MAX_WIDTH = 540;

module.exports = class CoverPageLegaMentionText extends Text {
  constructor() {
    const text =
      "Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l'accompagnement de leurs publics.";
    super({
      text,
      positionX: COVER_PAGE_LEGAL_MENTION_TEXT_X_POSITION,
      positionY: COVER_PAGE_LEGAL_MENTION_TEXT_Y_POSITION,
      fontSize: FontManager.coverPageLegalMentionHeight,
      font: FontManager.coverPageLegalMentionFont,
      fontColor: ColorManager.coverPageLegalMentionColor,
      maxWidth: COVER_PAGE_LEGAL_MENTION_TEXT_MAX_WIDTH,
    });
  }
};
