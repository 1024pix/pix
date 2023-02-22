import Text from './Text';
import ColorManager from '../manager/color-manager';
import FontManager from '../manager/font-manager';
import PositionManager from '../manager/position-manager';

const textByLang = {
  en: 'This is a working document, updated regularly. Its distribution is restricted and its use limited to Pix Orga members in the context of the implementation of the support of their users.',
  fr: "Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l'accompagnement de leurs publics.",
};

export default class CoverPageLegaLMentionText extends Text {
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
}
