import dayjs from 'dayjs';
import { Text } from './Text.js';
import * as ColorManager from '../manager/color-manager.js';
import { FontManager } from '../manager/font-manager.js';
import { PositionManager } from '../manager/position-manager.js';

const textByLang = {
  en: 'This is a working document, updated regularly. Its distribution is restricted and its use limited to Pix Orga members in the context of the implementation of the support of their users. - Version {date}',
  fr: "Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l'accompagnement de leurs publics. - Version du {date}",
};

class LegalMentionText extends Text {
  constructor({ language }) {
    let text = textByLang[language];
    const todayDateString = dayjs().locale(language).format('DD MMMM YYYY');
    text = text.replace('{date}', todayDateString);
    const font = FontManager.legalMentionFont;
    const fontSize = FontManager.legalMentionHeight;
    super({
      text,
      positionX: PositionManager.legalMentionHorizontalStart,
      positionY: PositionManager.legalMentionVerticalStart,
      fontSize,
      font,
      fontColor: ColorManager.legalMentionColor,
    });
  }
}

export { LegalMentionText };
