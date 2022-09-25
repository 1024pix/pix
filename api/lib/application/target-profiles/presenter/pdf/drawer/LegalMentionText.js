const dayjs = require('dayjs');
const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');

const LEGAL_MENTION_TEXT_X_POSITION = 20;
const LEGAL_MENTION_TEXT_Y_POSITION = 5;

const textByLang = {
  en: 'This is a working document, updated regularly. Its distribution is restricted and its use limited to Pix Orga members in the context of the implementation of the support of their users. - Version {date}',
  fr: "Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l'accompagnement de leurs publics. - Version du {date}",
};

module.exports = class LegalMentionText extends Text {
  constructor({ language }) {
    let text = textByLang[language];
    const todayDateString = dayjs().locale(language).format('DD MMMM YYYY');
    text = text.replace('{date}', todayDateString);
    const font = FontManager.legalMentionFont;
    const fontSize = FontManager.legalMentionHeight;
    super({
      text,
      positionX: LEGAL_MENTION_TEXT_X_POSITION,
      positionY: LEGAL_MENTION_TEXT_Y_POSITION,
      fontSize,
      font,
      fontColor: ColorManager.legalMentionColor,
    });
  }
};
