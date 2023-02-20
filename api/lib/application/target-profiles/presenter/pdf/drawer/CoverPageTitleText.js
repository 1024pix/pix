import Text from './Text';
import ColorManager from '../manager/color-manager';
import FontManager from '../manager/font-manager';
import PositionManager from '../manager/position-manager';

export default class CoverPageTitleText extends Text {
  constructor({ title, page }) {
    const text = title;
    const font = FontManager.coverPageTitleFont;
    const fontSize = FontManager.coverPageTitleHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY: PositionManager.coverPageTitleVerticalStart,
      fontSize,
      font,
      fontColor: ColorManager.coverPageTitleColor,
      maxWidth: PositionManager.coverPageTitleWidth,
    });
  }
}
